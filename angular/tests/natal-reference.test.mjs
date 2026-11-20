import test from 'node:test';
import assert from 'node:assert/strict';
import { SwissEphemeris, Planet, HouseSystem, CalculationFlag } from '@swisseph/browser';

// Independently calculated with pyswisseph 2.10.03, swe.calc_ut and swe.houses_ex(..., b'P').
// All timestamps are UTC; coordinates are latitude north / longitude east in degrees.
const references = [
  {name:'Greenwich J2000',iso:'2000-01-01T12:00:00Z',lat:51.4779,lon:0,
   asc:24.26618920267986,mc:279.61108780028457,sun:280.36891967534336,moon:223.32377543840954,
   cusps:[24.266189,61.142401,82.020814,99.611088,119.061909,147.700657,204.266189,241.142401,262.020814,279.611088,299.061909,327.700657]},
  {name:'Kyiv 1990',iso:'1990-05-15T11:30:00Z',lat:50.4501,lon:30.5234,
   asc:169.9703884565215,mc:77.07741072588827,sun:54.376030080490125,moon:296.9045391025581,
   cusps:[169.970388,192.867737,221.899958,257.077411,293.537856,324.737492,349.970388,12.867737,41.899958,77.077411,113.537856,144.737492]},
  {name:'New York 1985',iso:'1985-07-13T17:15:00Z',lat:40.7128,lon:-74.006,
   asc:200.80262164439344,mc:114.3638119077066,sun:111.23548148304747,moon:61.43558455107825,
   cusps:[200.802622,228.367859,259.986231,294.363812,327.682334,356.745520,20.802622,48.367859,79.986231,114.363812,147.682334,176.745520]},
];
const difference=(a,b)=>Math.min(Math.abs(a-b)%360,360-Math.abs(a-b)%360);
test('Swiss Ephemeris WASM numerical natal reference fixtures (0.02° tolerance)',async()=>{
 const swe=new SwissEphemeris();
 await swe.init();
 try {
  await swe.loadStandardEphemeris();
  for(const fixture of references){
   const jd=swe.dateToJulianDay(new Date(fixture.iso));
   const h=swe.calculateHouses(jd,fixture.lat,fixture.lon,HouseSystem.Placidus);
   const cusps=h.cusps.length===13?h.cusps.slice(1):h.cusps;
   assert.equal(cusps.length,12,fixture.name+' cusp count');
   for(const [label,actual,expected] of [['ASC',h.ascendant,fixture.asc],['MC',h.mc,fixture.mc],['Sun',swe.calculatePosition(jd,Planet.Sun,CalculationFlag.SwissEphemeris).longitude,fixture.sun],['Moon',swe.calculatePosition(jd,Planet.Moon,CalculationFlag.SwissEphemeris).longitude,fixture.moon]]){
    assert.ok(difference(actual,expected)<0.02,fixture.name+' '+label+': '+actual+' vs '+expected);
   }
   cusps.forEach((c,i)=>assert.ok(difference(c,fixture.cusps[i])<0.02,fixture.name+' cusp '+(i+1)));
  }
 } finally {swe.close();}
});
