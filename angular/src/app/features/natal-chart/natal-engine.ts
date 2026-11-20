import { SwissEphemeris, Planet, HouseSystem, CalculationFlag } from '@swisseph/browser';
export type Birth = { date:string; time:string; timezone:string; latitude:number; longitude:number };
export type Body = { name:string; longitude:number; house:number; retrograde:boolean };
export type Aspect = { a:string; b:string; name:string; orb:number };
export type Chart = { utc:string; bodies:Body[]; cusps:number[]; asc:number; mc:number; aspects:Aspect[] };
export const norm=(x:number)=>((x%360)+360)%360;
export function localToUtc(b:Birth):Date {
 const target=b.date+'T'+b.time;
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(target))throw Error('Некоректна дата або час');
 const [y,m,d]=b.date.split('-').map(Number),[h,min]=b.time.split(':').map(Number);
 const ms=Date.UTC(y,m-1,d,h,min);
 if(new Date(ms).toISOString().slice(0,16)!==target)throw Error('Некоректна дата');
 const fmt=new Intl.DateTimeFormat('en-GB',{timeZone:b.timezone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 const matches:Date[]=[];
 for(let offset=-840;offset<=840;offset+=15){
  const dt=new Date(ms-offset*60000),p=fmt.formatToParts(dt);
  const get=(key:string)=>p.find(x=>x.type===key)?.value??'';
  if(get('year')+'-'+get('month')+'-'+get('day')+'T'+get('hour')+':'+get('minute')===target)matches.push(dt);
 }
 if(matches.length!==1)throw Error(matches.length?'Неоднозначний час через перехід на зимовий час':'Час не існує через перехід на літній час');
 return matches[0];
}
export function house(longitude:number,cusps:number[]):number {
 for(let i=0;i<12;i++){const width=norm(cusps[(i+1)%12]-cusps[i]);if(width>0&&norm(longitude-cusps[i])<width)return i+1;}
 throw Error('Не вдалося визначити дім');
}
export function aspects(bodies:Body[]):Aspect[]{
 const defs:[string,number,number][]=[['З’єднання',0,8],['Секстиль',60,5],['Квадрат',90,6],['Трин',120,6],['Опозиція',180,8]];
 const found:Aspect[]=[];
 for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
  const diff=Math.abs(norm(bodies[i].longitude)-norm(bodies[j].longitude)),sep=Math.min(diff,360-diff);
  for(const [name,angle,maxOrb] of defs)if(Math.abs(sep-angle)<=maxOrb){found.push({a:bodies[i].name,b:bodies[j].name,name,orb:Math.abs(sep-angle)});break;}
 }
 return found.sort((a,b)=>a.orb-b.orb);
}
export async function calculate(b:Birth):Promise<Chart>{
 const utc=localToUtc(b),swe=new SwissEphemeris();await swe.init();
 try {
  await swe.loadStandardEphemeris();
  const jd=swe.dateToJulianDay(utc);
  const houses=swe.calculateHouses(jd,b.latitude,b.longitude,HouseSystem.Placidus);
  const raw=houses.cusps,cusps=raw.length===13?raw.slice(1):raw.slice();
  if(cusps.length!==12||cusps.some(x=>!Number.isFinite(x)))throw Error('Плацидус недоступний для цієї широти');
  const ids:[string,Planet][]=[['Сонце',Planet.Sun],['Місяць',Planet.Moon],['Меркурій',Planet.Mercury],['Венера',Planet.Venus],['Марс',Planet.Mars],['Юпітер',Planet.Jupiter],['Сатурн',Planet.Saturn],['Уран',Planet.Uranus],['Нептун',Planet.Neptune],['Плутон',Planet.Pluto]];
  const bodies=ids.map(([name,id])=>{
   const pos=swe.calculatePosition(jd,id,CalculationFlag.SwissEphemeris);
   if(!Number.isFinite(pos.longitude))throw Error('Немає ефемерид для '+name);
   return {name,longitude:norm(pos.longitude),house:house(pos.longitude,cusps),retrograde:(pos.longitudeSpeed??0)<0};
  });
  return {utc:utc.toISOString(),bodies,cusps,asc:norm(houses.ascendant),mc:norm(houses.mc),aspects:aspects(bodies)};
 }finally{swe.close();}
}
