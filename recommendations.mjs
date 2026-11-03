import {roomState} from './core.mjs';
import {NON_STUDY_ROOMS,lunchWindow} from './availability.mjs';
export const AMPHITHEATRES=['106','107','126','127','229','230','231','227','215','216'];
export const displayRoom=room=>room==='D380'?'380':room.replace(/^CATI\s*/,'ÇATI ');
const is300=room=>/^3\d{2}[A-Z]?$/.test(room)&&room!=='333'&&room!=='380';
export function projectPriority(room){
  if(NON_STUDY_ROOMS.includes(room)||room==='3400')return Infinity;
  if(/^34\d{2}$/.test(room))return 1;
  if(/^35\d{2}$/.test(room)&&!['3501','3506'].includes(room))return 2;
  if(['380','D380'].includes(room))return 3;
  if(['3501','3506'].includes(room))return 4;
  if(/^CATI\s*6$/.test(room))return 99;
  if(/^CATI\s*\d+$/.test(room))return 5;
  if(['131','134','136A','136B'].includes(room))return 6;
  if(['123A','123B','119A','119B'].includes(room))return 7;
  if(room==='333')return 8;
  if(['217E','217F','217G'].includes(room))return 9;
  if(['212','214'].includes(room))return 10;
  if(['217A','217B','217C','217D'].includes(room))return 11;
  if(['203A','203B','203C'].includes(room))return 12;
  if(is300(room))return 13;
  if(AMPHITHEATRES.includes(room))return 14;
  if(/^BIM\s*1$/.test(room))return 15;
  if(/^BIM\s*2$/.test(room))return 16;
  return 17;
}
export function priority(room,purpose='project'){
  const base=projectPriority(room);
  if(!Number.isFinite(base)||purpose!=='focus')return base;
  // 333 is promoted with the other three-digit 300 rooms for individual study.
  if(/^3\d{2}[A-Z]?$/.test(room)&&room!=='380')return 0;
  if(['380','D380'].includes(room))return .5;
  return base;
}
export function recommendations(data,day,start,end,purpose='project',rejected=new Set()){
  if(!Number.isInteger(day)||!Number.isFinite(start)||end<=start||start<480||end>1320)return [];
  if(purpose==='urgent')end=start+30;
  if(end>1320)return [];
  const lunch=lunchWindow(day);
  return data.rooms.filter(room=>Number.isFinite(priority(room,purpose))&&!rejected.has(room))
    .map(room=>({room,...roomState(data.events,room,day,start,end)}))
    .filter(s=>{
      if(!s.free)return false;
      // Skip a gap bounded by lessons that fits wholly inside the lunch break.
      const previous=s.meetings.filter(e=>e.end<=start).at(-1);
      const next=s.meetings.find(e=>e.start>=end);
      return !(lunch&&previous&&next&&previous.end>=lunch.start&&next.start<=lunch.end);
    })
    .sort((a,b)=>priority(a.room,purpose)-priority(b.room,purpose)||a.room.localeCompare(b.room,'tr',{numeric:true}));
}
