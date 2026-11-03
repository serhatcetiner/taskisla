import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {availability,teachingEnd,mergeMeetings} from '../availability.mjs';
import {FLOOR} from '../floor1.mjs';
import {FLOORS} from '../floors.mjs';
const e=(start,end,day=0)=>({room:'217A',day,start,end});
const check=(events,day,time)=>availability(events,['217A'],'217A',day,time);
test('Hafta içi 17.30 ve cuma 18.00 renk sınırları',()=>{
  assert.equal(teachingEnd(0),1050);assert.equal(teachingEnd(3),1050);assert.equal(teachingEnd(4),1080);assert.equal(teachingEnd(5),null);
  assert.equal(check([e(630,1050)],0,630).key,'red');
  assert.equal(check([e(630,1050,4)],4,630).key,'red');
  assert.equal(check([e(630,1080,4)],4,630).key,'red');
});
test('Dersler arasındaki gerçek boşluk pembe, bitişte koyu yeşil',()=>{
  assert.equal(check([e(510,750)],0,630).key,'pink');
  assert.equal(check([e(510,750)],0,750).key,'dark');
  assert.equal(check([e(510,750),e(810,1050)],0,630).key,'red');
  assert.equal(check([e(510,750),e(750,1050)],0,630).key,'red');
});
test('Boş odada sonraki ders açık yeşil, yoksa koyu yeşil',()=>{
  assert.equal(check([e(810,1050)],0,630).key,'light');
  assert.equal(check([e(510,630)],0,630).key,'dark');
});
test('17.30 sonrası ve hafta sonu boşluğu pembe yapmaz',()=>{
  assert.equal(check([e(510,1050)],0,1050).key,'dark');
  assert.equal(check([e(510,1050)],0,1200).key,'dark');
  assert.equal(check([e(510,1080,4)],4,1080).key,'dark');
  assert.equal(check([],5,630).key,'dark');assert.equal(check([],6,1200).key,'dark');
  assert.equal(check([],0,1319).key,'dark');assert.equal(check([],0,1320).key,'closed');
});
test('Gerçek bir geç ders kaydı olağan saat diye yok sayılmaz',()=>{
  assert.equal(check([e(1140,1200)],0,1100).key,'light');
  assert.equal(check([e(1140,1200)],0,1150).key,'red');
});
test('Çakışan veya bitişik dersler tek dolu bloktur',()=>{
  assert.deepEqual(mergeMeetings([e(700,800),e(500,710),e(800,900)]),[{start:500,end:900}]);
});
test('OBS eşleşmesi olmayan oda hiçbir zaman boş varsayılmaz',()=>{
  assert.equal(availability([],[],'203A',5,600).key,'unknown');
  assert.equal(availability([],[],'203A',0,1400).key,'unknown');
});
test('203 alanı eşit üç parça, 203C tekrarsız, idari mahaller yazısız',()=>{
  const rooms=FLOOR.rooms.filter(r=>r.id.startsWith('203'));
  assert.deepEqual(rooms.map(r=>r.id),['203A','203B','203C']);
  assert.ok(Math.max(...rooms.map(r=>r.w))-Math.min(...rooms.map(r=>r.w))<=1);
  assert.equal(new Set(FLOOR.rooms.map(r=>r.id)).size,FLOOR.rooms.length);
  assert.equal(FLOOR.excluded.length,10);
  for(const room of FLOOR.excluded) {assert.equal(room.label,undefined);assert.equal(room.id,undefined);}
});
test('Derslik kutuları birbirini örtmez',()=>{
  for(let i=0;i<FLOOR.rooms.length;i++)for(let j=i+1;j<FLOOR.rooms.length;j++){
    const a=FLOOR.rooms[i],b=FLOOR.rooms[j];
    assert.ok(!(a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y),`${a.id} and ${b.id}`);
  }
});
test('Gerçek programda geç ders ve hafta sonu dersi korunur',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../data/schedule.json',import.meta.url),'utf8'));
  assert.equal(availability(data.events,data.rooms,'216',0,1140).key,'red');
  assert.equal(availability(data.events,data.rooms,'131',5,600).key,'red');
  assert.equal(availability(data.events,data.rooms,'131',6,600).key,'red');
  assert.equal(availability(data.events,data.rooms,'106',0,1060).key,'light');
  assert.equal(availability(data.events,data.rooms,'107',3,1300).key,'dark');
});
test('SER-ATELYE çalışma önerisi olamaz',()=>{
  assert.equal(availability([],['SER-ATELYE'],'SER-ATELYE',0,600).key,'blocked');
  assert.equal(availability([],['SER-ATELYE'],'SER-ATELYE',6,600).key,'blocked');
});
test('Üç katta oda kutuları birbirine binmez, düzeltmeler ve oda etiketleri korunur',()=>{
  assert.equal(FLOORS.length,3);
  for(const floor of FLOORS){
    assert.equal(new Set(floor.rooms.map(r=>r.id)).size,floor.rooms.length);
    for(let i=0;i<floor.rooms.length;i++)for(let j=i+1;j<floor.rooms.length;j++){
      const a=floor.rooms[i],b=floor.rooms[j];
      assert.ok(!(a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y),`${floor.name}: ${a.id} and ${b.id}`);
    }
    for(const room of floor.excluded) assert.equal(room.label,undefined);
  }
  assert.ok(FLOORS[0].rooms.some(r=>r.id==='127'));
  assert.ok(FLOORS[1].rooms.some(r=>r.id==='215'));
  assert.ok(FLOORS[2].rooms.some(r=>r.id==='303'));
  assert.ok(!FLOORS[2].rooms.some(r=>r.id==='304'));
});
test('PEM, kaynak önceliği ve eksik alan tamamlaması veri dosyasında izlenir',()=>{
  const data=JSON.parse(fs.readFileSync(new URL('../data/schedule.json',import.meta.url),'utf8'));
  const audit=JSON.parse(fs.readFileSync(new URL('../data/source-audit.json',import.meta.url),'utf8'));
  assert.ok(data.events.some(e=>e.branch==='PEM' && e.level==='LS' && e.source==='obs'));
  assert.ok(data.events.some(e=>e.crn==='13984' && e.room==='215' && e.source==='obs+pdf'));
  assert.ok(data.events.some(e=>e.crn==='14739' && e.room==='303' && e.source==='obs'));
  assert.ok(!data.events.some(e=>e.crn==='14739' && e.room==='309'));
  assert.equal(data.snapshot,true);
  assert.equal(data.secondarySource.supplementedMeetings,audit.supplemented.length);
  assert.equal(data.secondarySource.pdfOnlyMeetings,audit.pdfOnly.length);
  assert.equal(data.secondarySource.conflicts,audit.conflicts.length);
  assert.equal(new Set(data.events.map(e=>[e.crn,e.day,e.start,e.end].join('/'))).size,data.events.length);
  assert.deepEqual(new Set(data.rooms),new Set(data.events.map(e=>e.room)));
  for(const e of data.events){assert.ok(e.start>=0 && e.end>e.start && e.end<=1440);assert.ok(e.day>=0 && e.day<=6);assert.ok(!('teacher' in e));}
});
