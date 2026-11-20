import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { calculate, Chart } from './natal-engine';
@Component({
 selector:'mg-natal-chart',standalone:true,imports:[FormsModule],
 templateUrl:'./natal-chart.component.html',styleUrl:'./natal-chart.component.css',
 changeDetection:ChangeDetectionStrategy.OnPush,
})
export default class NatalChartComponent {
 input={date:'',time:'',timezone:'Europe/Kyiv',latitude:null as number|null,longitude:null as number|null};
 readonly zones=Intl.supportedValuesOf('timeZone');
 readonly error=signal('');readonly busy=signal(false);readonly chart=signal<Chart|null>(null);
 async submit():Promise<void>{
  this.error.set('');this.chart.set(null);
  const {date,time,timezone,latitude,longitude}=this.input;
  if(latitude===null||longitude===null||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180){this.error.set('Перевірте координати.');return;}
  if(!this.zones.includes(timezone)&&timezone!=='UTC'){this.error.set('Некоректний часовий пояс.');return;}
  this.busy.set(true);
  try{this.chart.set(await calculate({date,time,timezone,latitude,longitude}));}
  catch(e){this.error.set(e instanceof Error?e.message:'Помилка обчислення.');}
  finally{this.busy.set(false);}
 }
 readonly signs=['Овен','Телець','Близнюки','Рак','Лев','Діва','Терези','Скорпіон','Стрілець','Козоріг','Водолій','Риби'];
 sign(l:number){return this.signs[Math.floor(l/30)];}
 degree(l:number){return (l%30).toFixed(2)+'°';}
 print(){window.print();}
}
