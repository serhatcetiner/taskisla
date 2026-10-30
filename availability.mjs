export const STATUS = {
  red: {name:'Dolu · boşluk yok',short:'Dolu',help:'Şu an ders var; olağan ders bitişine veya varsa son geç dersin bitişine kadar boşluk yok.'},
  pink: {name:'Dolu · sonra boşluk var',short:'Sonra boşalıyor',help:'Şu an ders var; olağan ders bitişinden veya varsa son geç dersin bitişinden önce boşluk açılıyor.'},
  light: {name:'Boş · sonra ders var',short:'Sonra ders var',help:'Şu an programda boş; ilerleyen saatte ders başlıyor.'},
  dark: {name:'Boş · başka ders yok',short:'Başka ders yok',help:'Şu an programda boş; günün kalanında başka kayıtlı ders yok.'},
  unknown: {name:'Program verisi yok',short:'Veri yok',help:'Bu oda mevcut taramadaki bir derslikle eşleşmiyor. Boş olduğu varsayılmaz.'},
  closed: {name:'Bina kapalı',short:'22.00 sonrası',help:'Belirtilen 22.00 kapanış sınırının dışında. Açık veya kullanıma uygun kabul edilmez.'},
  blocked: {name:'Ders çalışma alanı değil',short:'Kullanım dışı',help:'Bu atölye ders çalışmak için kullanılamaz; boş çalışma alanı olarak önerilmez.'}
};
export const NON_STUDY_ROOMS=['SER-ATELYE'];
export function teachingEnd(day) { return day < 4 ? 17*60+30 : day === 4 ? 18*60 : null; }
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
    return {key,...STATUS[key],current,next,meetings,horizon};
  }
  const block = mergeMeetings(meetings).find(e=>e.start<=time && e.end>time);
  const key = block.end >= horizon ? 'red':'pink';
  return {key,...STATUS[key],current,next,meetings,horizon,freeAt:block.end};
}
