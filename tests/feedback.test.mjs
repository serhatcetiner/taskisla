import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {availability} from '../availability.mjs';
import {recommendations,priority,AMPHITHEATRES} from '../recommendations.mjs';
const e=(start,end,day=0)=>({room:'305',day,start,end});
const check=(events,day,time)=>availability(events,['305'],'305',day,time);
test('Öğle arası önceki dolu dersi pembe yapmaz, arada boş olduğu saklanmaz',()=>{
  const events=[e(510,750),e(810,1050)];
  assert.equal(check(events,0,660).key,'red');
  assert.equal(check(events,0,780).key,'light');
  assert.equal(check(events,0,780).shortBreak,true);
  assert.equal(check(events,0,900).key,'red');
});
test('Cuma 12.30–14.00 arası ve son bir saat renk hesabında atlanır',()=>{
  assert.equal(check([e(510,750,4),e(840,1020,4)],4,660).key,'red');
  assert.equal(check([e(510,750,4),e(840,1020,4)],4,780).key,'light');
  assert.equal(check([e(840,1020,4)],4,900).key,'red');
  assert.equal(check([e(810,990)],0,900).key,'red');
  assert.equal(check([e(810,989)],0,900).key,'pink');
});
test('Öğleden sonra gerçek boşluk varsa pembe ve doğru boşluk saati',()=>{
  const state=check([e(510,750),e(810,930)],0,660);
  assert.equal(state.key,'pink');assert.equal(state.freeAt,930);
  assert.equal(check([e(510,720),e(840,1050)],0,660).key,'pink');
});
test('Gerçek 305 Salı örneği 11.00 kırmızı, 13.00 boş, 15.00 kırmızı',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../data/schedule.json',import.meta.url),'utf8'));
  for(const [time,key] of [[660,'red'],[780,'light'],[900,'red']])assert.equal(availability(data.events,data.rooms,'305',1,time).key,key);
});
test('Proje öncelikleri tüm gruplarda ve ÇATI6 en son',()=>{
  const order=['3407','3503','D380','3501','CATI1','131','123A','333','217E','212','217A','203A','305','106','BIM1','BIM2','213','CATI6'];
  for(let i=1;i<order.length;i++)assert.ok(priority(order[i-1])<priority(order[i]),order[i]);
  assert.equal(priority('3400'),Infinity);assert.equal(priority('227B'),Infinity);assert.equal(priority('SER-ATELYE'),Infinity);
});
test('Bireysel çalışma 300 odaları, sonra380, sonra kalan proje sırası',()=>{
  assert.ok(priority('305','focus')<priority('D380','focus'));
  assert.ok(priority('333','focus')<priority('D380','focus'));
  assert.ok(priority('D380','focus')<priority('3401','focus'));
  assert.ok(priority('3401','focus')<priority('3502','focus'));
  assert.equal(priority('3400','focus'),Infinity);
});
test('Öneri tüm süreyi denetler ve reddedilen yeri atlar',()=>{
  const data={rooms:['3400','3401','3502','305','227B','SER-ATELYE'],events:[{room:'3401',day:0,start:660,end:750}]};
  assert.equal(recommendations(data,0,630,690)[0].room,'3502');
  assert.equal(recommendations(data,0,630,690,'project',new Set(['3502']))[0].room,'305');
  assert.equal(recommendations(data,0,630,660,'urgent')[0].room,'3401');
  assert.equal(recommendations(data,0,630,690,'focus')[0].room,'305');
  assert.equal(recommendations(data,0,1300,1330).length,0);
});
test('Öğle arasına sıkışan yer önerilmez, tüm öğleden sonrası boşsa önerilir',()=>{
  assert.equal(recommendations({rooms:['305'],events:[e(510,750),e(810,1050)]},0,780,810).length,0);
  assert.equal(recommendations({rooms:['305'],events:[e(510,750)]},0,780,810).length,1);
});
test('227B kayıtlı olsun olmasın kapalı ve10amfi tanımlı',()=>{
  assert.equal(availability([],[],'227B',0,600).key,'blocked');
  assert.equal(AMPHITHEATRES.length,10);
});
test('216A/B küçük çalışma odalarıyla aynı öncelikte; kullanıma kapalı odalar önerilmez',()=>{
  for(const purpose of ['project','focus','urgent']){
    for(const room of ['216A','216B','217E','217F','217G'])assert.equal(priority(room,purpose),9);
    const data={rooms:['FOTOATOLYE','MZLB','MLZB','216A','217E'],events:[]};
    assert.deepEqual(recommendations(data,0,600,630,purpose).map(r=>r.room),['216A','217E']);
  }
  for(const room of ['FOTOATOLYE','MZLB','MLZB'])assert.equal(availability([],[],room,0,600).key,'blocked');
  assert.equal(availability([],[],'216B',0,600).key,'unknown');
});
