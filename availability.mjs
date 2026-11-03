export const STATUS = {
  red: {name:'Dolu · uygun boşluk yok',short:'Dolu',help:'Şu an ders var. Öğle arası ve gün sonundaki bir saatlik boşluk dışarıda tutulduğunda uygun boşluk açılmıyor.'},
  pink: {name:'Dolu · sonra boşluk var',short:'Sonra boşalıyor',help:'Şu an ders var; ilerleyen saatte çalışma için boşluk açılıyor.'},
  light: {name:'Boş · sonra ders var',short:'Sonra ders var',help:'Şu an programda boş; ilerleyen saatte ders başlıyor.'},
  dark: {name:'Boş · başka ders yok',short:'Başka ders yok',help:'Şu an programda boş; günün kalanında başka kayıtlı ders yok.'},
  unknown: {name:'Program verisi yok',short:'Veri yok',help:'Bu oda mevcut taramadaki bir derslikle eşleşmiyor. Boş olduğu varsayılmaz.'},
  closed: {name:'Bina kapalı',short:'22.00 sonrası',help:'Belirtilen 22.00 kapanış sınırının dışında. Açık veya kullanıma uygun kabul edilmez.'},
  blocked: {name:'Ders çalışma alanı değil',short:'Kullanım dışı',help:'Bu alan ders çalışmak için kullanılamaz; boş çalışma alanı olarak önerilmez.'}
};
export const NON_STUDY_ROOMS=['SER-ATELYE','227B'];
export function teachingEnd(day) { return day < 4 ? 17*60+30 : day === 4 ? 18*60 : null; }
export function lunchWindow(day) {return day<5 ? {start:750,end:day===4?840:810} : null;}
// A lunch-only gap and the last hour of the teaching day do not make a busy room pink.
export function usefulGaps(meetings,day,time) {
  const horizon=Math.max(teachingEnd(day)??time,...meetings.map(e=>e.end));
  const lunch=lunchWindow(day), blocks=mergeMeetings(meetings), gaps=[];
  for(let i=0;i<blocks.length;i++){
    const start=Math.max(time,blocks[i].end), end=Math.min(horizon,blocks[i+1]?.start??horizon);
    if(end<=start)continue;
    if(lunch && start>=lunch.start && end<=lunch.end)continue;
    if(i===blocks.length-1 && end-start<=60)continue;
    gaps.push({start,end});
  }
  return gaps;
}
export function mergeMeetings(events) {
  const merged = [];
  for (const e of [...events].sort((a,b)=>a.start-b.start)) {
    const last = merged.at(-1);
    if (last && e.start <= last.end) last.end = Math.max(last.end,e.end);
    else merged.push({start:e.start,end:e.end});
  }
  return merged;
}
export function availability(events, knownRooms, room, day, time) {
  if(NON_STUDY_ROOMS.includes(room))return {key:'blocked',...STATUS.blocked};
  if (!knownRooms.includes(room)) return {key:'unknown',...STATUS.unknown};
  const meetings = events.filter(e=>e.room===room && e.day===day);
  const current = meetings.filter(e=>e.start<=time && e.end>time);
  const next = meetings.filter(e=>e.start>time).sort((a,b)=>a.start-b.start)[0];
  const end = teachingEnd(day);
  // Do not discard an actual lesson that extends past the usual timetable.
  const horizon = Math.max(end ?? time, ...meetings.map(e=>e.end));
  if (time >= 22*60) return {key:'closed',...STATUS.closed,current,next,meetings};
  if (!current.length) {
    const key = next ? 'light':'dark';
    const lunch=lunchWindow(day);
    const shortBreak=Boolean(lunch && time>=lunch.start && time<lunch.end && next && next.start<=lunch.end);
    return {key,...STATUS[key],current,next,meetings,horizon,shortBreak};
  }
  const gap=usefulGaps(meetings,day,time)[0];
  const key = gap ? 'pink':'red';
  return {key,...STATUS[key],current,next,meetings,horizon,freeAt:gap?.start};
}
