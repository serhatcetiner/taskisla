import { DAYS, minutes, clock, overlaps, roomState, validRange, dayOfDate, istanbulNow } from './core.mjs';
import { recommendations, priority, AMPHITHEATRES, displayRoom } from './recommendations.mjs';
import { FLOORS } from './floors.mjs';
import { availability, STATUS, NON_STUDY_ROOMS } from './availability.mjs';
const $ = id => document.getElementById(id);
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data, filter = 'free', favorites = new Set(), selectedRoom;
let planZoom = 1;
let floor = FLOORS[2];
let selectedDay, duration = 60, purpose = 'project', rejected = new Set(), recommendedRoom;
try { const saved = JSON.parse(localStorage.getItem('taskisla-favorites') || '[]'); if (Array.isArray(saved)) favorites = new Set(saved.filter(x => typeof x === 'string')); } catch {}
function setStart(value) {
  if (![...$('start').options].some(o=>o.value===value)) $('start').add(new Option(value,value));
  $('start').value=value;
}
function setNow() {
  const now=istanbulNow(); selectedDay=dayOfDate(now.date); setStart(now.time);
}
function range() { const start=minutes($('start').value); return {day:selectedDay,start,end:start+duration}; }
function usableRange(start,end){return validRange(start,end)&&start>=480&&end<=1320;}
function renderDays() {
  $('days').innerHTML=DAYS.map((name,index)=>`<button data-day="${index}" aria-pressed="${index===selectedDay}">${name}</button>`).join('');
}
function resetSearch(){rejected.clear();render();}
function renderRecommendation() {
  const {day,start,end}=range();
  const candidates=recommendations(data,day,start,end,purpose,rejected);
  recommendedRoom=candidates[0]?.room;
  const target=$('recommendation');
  if(!recommendedRoom){target.innerHTML=`<p class="eyebrow">SANA UYGUN BİR YER</p><h2>${rejected.size?'Sıradaki uygun yer kalmadı.':'Bu süreye uygun bir yer bulamadık.'}</h2><p>Başlangıcı veya çalışma süresini değiştirebilirsin.</p>${rejected.size?'<button id="retry-rooms" class="now-button">Atladığım derslikleri yeniden göster</button>':''}`;return;}
  const room=recommendedRoom;
  const mappedFloor=FLOORS.find(f=>f.rooms.some(r=>r.id===room));
  target.innerHTML=`<div><p class="eyebrow">SANA UYGUN BİR YER</p><h2>${escape(displayRoom(room))} <span>${AMPHITHEATRES.includes(room)?'Amfi':mappedFloor?.name||'Derslik'}</span></h2><p>${DAYS[day]} · ${clock(start)}–${clock(end)} boyunca programda boş.</p></div><div class="recommendation-actions"><button id="see-recommended">Haritada ve programda gör ↗</button><button id="reject-room">Bu derslik dolu! →</button></div>`;
}
function kind(room) { if(AMPHITHEATRES.includes(room))return 'AMFİ'; return /^\d/.test(room) || /^D\d/.test(room) ? 'DERSLİK' : 'STÜDYO / ÖZEL ALAN'; }
function renderPlan() {
  if (!data) return;
  const {day,start,end} = range();
  const valid = Number.isInteger(day) && validRange(start,end);
  $('plan-body').hidden = !valid;
  $('plan-invalid').hidden = Boolean(valid);
  if (!valid) return;
  const states = floor.rooms.map(r=>({...r,state:availability(data.events,data.rooms,r.id,day,start)}));
  $('plan-title').textContent=`${floor.name} planı`;
  const counts = states.reduce((a,r)=>{a[r.state.key]=(a[r.state.key]||0)+1;return a;},{});
  $('plan-time').textContent = `${DAYS[day]} · ${clock(start)}`;
  $('plan-time-output').textContent = clock(start);
  $('plan-slider').value = Math.max(480,Math.min(1320,start));
  $('plan-summary').textContent = start>=1320 ? '22.00 kapanış sınırının dışındasın.' : `${(counts.light||0)+(counts.dark||0)} derslik şu an programda boş · ${(counts.red||0)+(counts.pink||0)} derslikte ders var · ${counts.unknown||0} alanda veri yok${counts.blocked?' · '+counts.blocked+' alan ders çalışmaya kapalı':''}`;
  $('plan-legend').innerHTML = [...(start>=1320?['closed']:['light','dark','pink','red']),'unknown',...(counts.blocked?['blocked']:[])].map(key=>`<span title="${escape(STATUS[key].help)}"><i class="swatch ${key}"></i>${STATUS[key].name}</span>`).join('');
  const box = (r,cls,extra='')=>`<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="4" class="${cls}" ${extra}/>`;
  const text = (r,content,cls='')=>`<text x="${r.x+r.w/2}" y="${r.y+r.h/2}" class="${cls}">${escape(content)}</text>`;
  $('floor-map').innerHTML = `<title id="floor-title">Taşkışla ${escape(floor.name)} derslik şeması</title><desc id="floor-desc">${escape($('plan-summary').textContent)}. Oda numarasına tıklayarak programı açabilirsin.</desc><defs><pattern id="unknown-pattern" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M-2 2L2-2M0 8L8 0M6 10L10 6" stroke="#c5c8be" stroke-width="1"/></pattern></defs>
    <rect x="28" y="33" width="1044" height="749" rx="14" class="map-outline"/>
    <path d="M231 132H892V279H897V661H869V674H270V661H228V279H231Z" class="map-corridor"/>
    <rect x="272" y="${floor.id==='cati'?242:279}" width="594" height="${floor.id==='cati'?307:288}" rx="8" class="map-courtyard"/>
    <text x="569" y="415" class="courtyard-label">ORTABAHÇE</text><text x="569" y="438" class="courtyard-sub">TAŞKIŞLA</text>
    <text x="569" y="163" class="corridor-label">KORİDOR</text><text x="569" y="651" class="corridor-label">KORİDOR</text>
    <text x="252" y="450" class="corridor-label vertical">KORİDOR</text><text x="880" y="450" class="corridor-label vertical">KORİDOR</text>
    ${floor.excluded.map(r=>box(r,'map-excluded')).join('')}
    ${floor.facilities.map(r=>`<g>${box(r,'map-facility')}${text(r,r.label,r.vertical?'facility-label vertical':'facility-label')}</g>`).join('')}
    ${floor.id==='birinci'?'<text x="133" y="672" class="hall-label">ATATÜRK HOLÜ</text><text x="980" y="672" class="hall-label">MİMAR SİNAN HOLÜ</text>':''}
    ${floor.entrance?'<text x="596" y="780" class="hall-label">↑ BİNA GİRİŞİ</text>':''}
    ${states.map(r=>{
      const s=r.state;
      const aria=`${r.label||r.id}: ${s.name}${s.next ? ', sonraki ders '+clock(s.next.start):''}`;
      return `<g role="button" tabindex="0" class="map-room ${s.key}" data-room="${escape(r.id)}" aria-label="${escape(aria)}"><title>${escape(aria)}. Ayrıntıları aç.</title>${box(r,'room-shape')}${['unknown','blocked'].includes(s.key)?box(r,'room-hatch','aria-hidden="true"'):''}${text({...r,y:r.y-(AMPHITHEATRES.includes(r.id)?8:0)},r.label||r.id,r.small?'room-label small-label':'room-label')}${AMPHITHEATRES.includes(r.id)?text({...r,y:r.y+13},'AMFİ','amphi-label'):''}</g>`;
    }).join('')}`;
}
function timeline(meetings, start, end) {
  const position = n => Math.max(0, Math.min(100, (n - 480) / 840 * 100));
  const bar = (s, e, cls) => `<span class="${cls}" style="left:${position(s)}%;width:${Math.max(0, position(e) - position(s))}%"></span>`;
  return `<div class="timeline" aria-hidden="true">${meetings.map(e => bar(e.start, e.end, 'event')).join('')}${bar(start, end, 'chosen')}</div><div class="timeline-labels" aria-hidden="true"><span>08.00</span><span>15.00</span><span>22.00</span></div>`;
}
function render() {
  renderDays();
  if (!data) return;
  const {day, start, end} = range();
  const valid = Number.isInteger(day) && usableRange(start, end);
  $('input-error').hidden = Boolean(valid);
  $('input-error').textContent = 'Çalışma aralığını 08.00–22.00 içinde seç. Bu süre kapanış saatini aşıyor olabilir.';
  document.querySelectorAll('#presets button').forEach(b => b.setAttribute('aria-pressed', String(end - start === Number(b.dataset.min))));
  document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed', String(filter === b.dataset.filter)));
  renderPlan();
  renderRecommendation();
  $('range-summary').textContent=`${DAYS[day]} · ${clock(start)}${end<=1440?'–'+clock(end):' · '+duration/60+' saat, kapanışı aşıyor'}${purpose==='urgent'?' · Acil teslim için 30 dakika':''}`;
  document.querySelectorAll('#purposes button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.purpose===purpose)));
  document.querySelectorAll('#presets button').forEach(b=>b.disabled=purpose==='urgent' && b.dataset.min!=='30');
  if (!valid) {
    $('results').innerHTML = '<p class="empty">Sonuçları görmek için saat ve süreyi düzelt.</p>';
    $('results-title').textContent = 'Saat aralığını kontrol et';
    for (const id of ['free-count', 'all-count', 'busy-count']) $(id).textContent = '—';
    return;
  }
  const states = data.rooms.filter(room=>!NON_STUDY_ROOMS.includes(room)).map(room => ({room, ...roomState(data.events, room, day, start, end)}));
  const free = states.filter(s => s.free).length;
  $('free-count').textContent = free;
  $('all-count').textContent = states.length;
  $('busy-count').textContent = states.length - free;
  $('selection-label').textContent = `${DAYS[day].toLocaleUpperCase('tr-TR')} · ${clock(start)}–${clock(end)}`;
  $('results-title').textContent = `${free} derslik programda boş görünüyor`;
  const search = $('search').value.trim().toLocaleUpperCase('tr-TR');
  const shown = states.filter(s => (filter === 'all' || (filter === 'free' && s.free) || (filter === 'busy' && !s.free) || (filter === 'saved' && favorites.has(s.room))) && s.room.toLocaleUpperCase('tr-TR').includes(search));
  shown.sort((a,b)=>priority(a.room,purpose)-priority(b.room,purpose)||a.room.localeCompare(b.room,'tr',{numeric:true}));
  $('results').innerHTML = shown.length ? shown.map(s => {
    const info = s.free ? (s.next ? `${clock(s.next.start)}’a kadar programda ders yok` : 'Seçilen saatten sonra kayıtlı ders yok') : `${s.conflicts.map(e => e.code).filter((x,i,a) => a.indexOf(x) === i).join(' · ')}`;
    return `<article class="room-card ${s.free ? '' : 'busy'} ${s.room.length > 5 ? 'long' : ''}"><div class="room-top"><span class="room-kind">MMB / ${kind(s.room)}</span><button class="favorite" data-save="${escape(s.room)}" aria-label="${escape(s.room)} dersliğini ${favorites.has(s.room) ? 'favorilerden çıkar' : 'kaydet'}" aria-pressed="${favorites.has(s.room)}">${favorites.has(s.room) ? '♥' : '♡'}</button></div><div class="room-name"><h3>${escape(s.room)}</h3><span class="status">${s.free ? '● Programda boş' : '● Ders var'}</span></div><p class="room-info" title="${escape(info)}">${escape(info)}</p>${timeline(s.meetings, start, end)}<button class="card-bottom" data-room="${escape(s.room)}"><span>Haftalık programa bak</span><b aria-hidden="true">↗</b></button></article>`;
  }).join('') : `<div class="empty">${filter === 'saved' && !favorites.size ? 'Henüz kaydedilen derslik yok.<br>Derslik kartındaki kalbe dokunarak kaydet.' : 'Bu filtrelerle eşleşen derslik bulunamadı.<br>Saat aralığını veya arama metnini değiştirebilirsin.'}</div>`;
  $('scope-note').textContent = `${shown.length} / ${states.length} derslik gösteriliyor. Derslik listesi, seçilen kodlarda en az bir MMB oturumu bulunan mekânlardan oluşur. Saatler İstanbul saatidir; seçilen günün tekrarlayan programı gösterilir.`;
  const missing = data.coverage.filter(c => c.status !== 'ok');
  const warnings = [];
  if(end>1320) warnings.push('Seçtiğin aralık, belirtilen 22.00 bina kapanışını aşıyor. Programda ders olmaması binanın açık olduğu anlamına gelmez.');
  if (missing.length) warnings.push(`${missing.map(c => c.code).join(', ')} şu an OBS seçim listesinde yok.`);
  if (data.unresolved.length) warnings.push(`${data.unresolved.length} kaydın derslik bilgisi kesin tamamlanamadı; doluluk hesabına katılmadı.`);

  $('notice').hidden = !warnings.length;
  $('notice').innerHTML = warnings.map(escape).join(' ') + ' <button id="coverage-link">Kapsamı incele ↗</button>';
  $('coverage-link')?.addEventListener('click', () => $('coverage').showModal());
}
function openRoom(room) {
  selectedRoom = room;
  $('detail-title').textContent = `${room} · Haftalık program`;
  const current = range();
  const mapped = FLOORS.flatMap(f=>f.rooms).find(r=>r.id===room);
  const state = availability(data.events,data.rooms,room,current.day,current.start);
  $('detail-title').textContent = `${mapped?.label || room} · Haftalık program`;
  if(state.key==='blocked'){
    $('detail-content').innerHTML=`<p class="dialog-note">${escape(room)} ders çalışma alanı olarak kullanılamaz.</p>`;
    $('detail').showModal();return;
  }
  if (state.key==='unknown') {
    $('detail-content').innerHTML = '<p class="dialog-note">Bu alan, mevcut OBS taramasındaki bir derslikle eşleşmiyor. Program kaydı bulunmaması boş olduğu anlamına gelmez.</p>' + (room.startsWith('203') ? '<p class="dialog-note">203A, 203B ve 203C, ortak uzun alanın üç eşit bölümü olarak çizildi. Şemadaki ayrım fiziksel duvar olduğu anlamına gelmez.</p>':'');
    $('detail').showModal(); return;
  }
  $('detail-content').innerHTML = '' + DAYS.map((day, i) => {
    const meetings = data.events.filter(e => e.room === selectedRoom && e.day === i).sort((a,b) => a.start - b.start);
    return `<section class="day-section"><h3>${day}${i === current.day ? ' · Seçilen gün' : ''}</h3>${meetings.length ? meetings.map(e => `<div class="meeting"><time>${clock(e.start)}–${clock(e.end)}</time><div><strong>${escape(e.code)}</strong> · ${escape(e.name)}<span>${e.level === 'LS' ? 'Lisans' : e.level==='LUI'?'Lisansüstü 2. öğretim':'Lisansüstü'} · CRN ${escape(e.crn)}${e.provisional?' · PDF’de bölüm onayı bekleyen derslik':''}${overlaps(e, current.day, current.start, current.end) ? ' · Seçilen saatle çakışıyor' : ''}</span></div></div>`).join('') : '<p class="dialog-note">Taranan programda kayıtlı ders yok.</p>'}</section>`;
  }).join('');
  const currentCourses=state.current?.map(e=>`${e.code} · ${e.name}`).filter((x,i,a)=>a.indexOf(x)===i).join(' / ');
  const summary=currentCourses ? `Dolu · ${currentCourses} · ${state.key==='pink'?'sonra boşluk var':'uygun boşluk yok'}` : state.name;
  $('detail-content').insertAdjacentHTML('afterbegin',`<p class="detail-state ${state.key}"><strong>${escape(summary)}</strong>${state.shortBreak?'<br>Öğle arası · kısa çalışma aralığı.':''}${state.key==='pink' && state.freeAt?' <br>Uygun boşluk: '+clock(state.freeAt)+'.':''}</p>`);
  if(['light','dark'].includes(state.key)&&Number.isFinite(priority(room,purpose)))$('detail-content').insertAdjacentHTML('afterbegin','<button id="reject-detail-room" class="now-button">Bu derslik dolu! Sıradaki yeri bul →</button>');
  $('detail').showModal();
}
function renderCoverage() {
  const updated = new Intl.DateTimeFormat('tr-TR', {timeZone:'Europe/Istanbul',dateStyle:'long',timeStyle:'short'}).format(new Date(data.updatedAt));
  $('term').textContent = `${data.terms.LS} · ${data.rooms.length} mekân`;
  $('updated').textContent = `Son veri: ${updated}`;
  const secondary=data.secondarySource;
  const sourceCounts=data.events.reduce((a,e)=>{a[e.source]=(a[e.source]||0)+1;return a;},{});
  $('coverage-content').innerHTML=`<p class="dialog-note"><a href="${escape(data.source)}" target="_blank" rel="noopener noreferrer"><u>İTÜ OBS Ders Programı ↗</u></a><br>Bir defalık veri alımı: ${updated} (İstanbul).<br>${data.events.length} oturum · ${data.rooms.length} mekân. Bu sürüm sabittir; site OBS’ye istek göndermez.</p>
  <p class="dialog-note"><strong>Öncelik: OBS → derslik PDF’si.</strong> ${sourceCounts.obs||0} oturum doğrudan OBS’den; ${sourceCounts['obs+pdf']||0} oturumun eksik bilgisi PDF ile tamamlandı; ${sourceCounts.pdf||0} oturum yalnızca PDF’de bulundu. Tam OBS kaydı PDF ile değiştirilmedi. Eşleştirme CRN, bilinen gün ve saat üzerinden yapıldı.</p>
  <p class="dialog-note">İkincil kaynak: ${escape(secondary?.name||'—')}. ${secondary?.conflicts||0} farklılıkta OBS korundu. Yalnızca PDF’deki kayıtların OBS’de güncel karşılığı doğrulanamadı. SBP proje derslikleri PDF’de bölüm onayı bekleyen kayıtlar olarak işaretlidir.</p>
  <p class="dialog-note">Akşam ve hafta sonu dersleri hesaba dahildir. Hafta içi 17.30, cuma 18.00 olağan sınırları, gerçek geç dersleri silmez. 22.00 sonrası bina kapalı kabul edilir. SER-ATELYE boş çalışma alanı olarak önerilmez.</p>
  <table><thead><tr><th>Düzey</th><th>Kod</th><th>OBS satırı</th><th>MMB oturumu</th></tr></thead><tbody>${data.coverage.map(c=>`<tr><td>${c.level==='LS'?'Lisans':c.level==='LUI'?'Lisansüstü 2. öğretim':'Lisansüstü'}</td><td>${escape(c.code)}</td><td>${c.status==='ok'?c.rows:'Listede yok'}</td><td>${c.meetings||0}</td></tr>`).join('')}</tbody></table>
  <p class="dialog-note">Gün seçimi sabit haftalık programı gösterir. Tatiller, sınav haftaları ve dönem sınırları kontrol edilmez. OBS’nin 12:29 bitiş dakikası dahil sayılır; uygulamada 12:30’a kadar doludur.</p>
  <details><summary>Eksik bilgili ${data.unresolved.length} kayıt</summary>${data.unresolved.map(e=>`<p class="dialog-note">${escape(e.code)} · CRN ${escape(e.crn)} · ${typeof e.day==='number'?DAYS[e.day]:escape(e.day||'Gün belirsiz')} · ${escape(e.reason||'Eksik bilgi')}</p>`).join('')}</details>`;

}
for(let t=480;t<=1320;t+=15)$('start').add(new Option(clock(t),clock(t)));
setNow();renderDays();
$('start').addEventListener('change',resetSearch);
$('search').addEventListener('input',render);
$('now').addEventListener('click',()=>{setNow();resetSearch();});
$('presets').addEventListener('click',e=>{const b=e.target.closest('[data-min]');if(!b||b.disabled)return;duration=Number(b.dataset.min);resetSearch();});
$('days').addEventListener('click',e=>{const b=e.target.closest('[data-day]');if(!b)return;selectedDay=Number(b.dataset.day);resetSearch();});
$('purposes').addEventListener('click',e=>{const b=e.target.closest('[data-purpose]');if(!b)return;const wasUrgent=purpose==='urgent';purpose=b.dataset.purpose;if(purpose==='urgent')duration=30;else if(wasUrgent)duration=60;resetSearch();});
$('recommendation').addEventListener('click',e=>{
  if(e.target.closest('#retry-rooms')){resetSearch();return;}
  if(e.target.closest('#reject-room') && recommendedRoom){rejected.add(recommendedRoom);renderRecommendation();return;}
  if(e.target.closest('#see-recommended') && recommendedRoom){const f=FLOORS.find(f=>f.rooms.some(r=>r.id===recommendedRoom));if(f){floor=f;$('floor-select').value=f.id;renderPlan();$('kat-plani').scrollIntoView({behavior:'smooth'});}openRoom(recommendedRoom);}
});
$('detail-content').addEventListener('click',e=>{if(e.target.closest('#reject-detail-room')){rejected.add(selectedRoom);$('detail').close();renderRecommendation();$('recommendation').scrollIntoView({behavior:'smooth',block:'center'});}});
$('filters').addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (!b) return; filter = b.dataset.filter; render(); });
$('results').addEventListener('click', e => {
  const save = e.target.closest('[data-save]');
  if (save) { const room = save.dataset.save; favorites.has(room) ? favorites.delete(room) : favorites.add(room); try { localStorage.setItem('taskisla-favorites', JSON.stringify([...favorites])); } catch {} render(); return; }
  const button = e.target.closest('[data-room]'); if (button) openRoom(button.dataset.room);
});
$('floor-select').addEventListener('change',()=>{floor=FLOORS.find(f=>f.id===$('floor-select').value)||FLOORS[1];zoomPlan(1);renderPlan();});
$('floor-map').addEventListener('click',e=>{const room=e.target.closest('[data-room]');if(room)openRoom(room.dataset.room);});
$('floor-map').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){const room=e.target.closest('[data-room]');if(room){e.preventDefault();openRoom(room.dataset.room);}}});
$('plan-slider').addEventListener('input',()=>{setStart(clock(Number($('plan-slider').value)));resetSearch();});
function zoomPlan(amount){planZoom=Math.max(1,Math.min(2.5,amount));$('floor-map').style.width=`${planZoom*100}%`;$('floor-map').style.minWidth=planZoom===1?'0':`${560*planZoom}px`;$('zoom-out').disabled=planZoom===1;$('zoom-in').disabled=planZoom===2.5;}
$('zoom-in').addEventListener('click',()=>zoomPlan(planZoom+.25));
$('zoom-out').addEventListener('click',()=>zoomPlan(planZoom-.25));
$('zoom-reset').addEventListener('click',()=>zoomPlan(1));
zoomPlan(1);
$('about').addEventListener('click', () => { if (data) $('coverage').showModal(); });
document.querySelectorAll('dialog').forEach(d => { d.querySelector('.close').addEventListener('click', () => d.close()); d.addEventListener('click', e => { if (e.target === d) { const r = d.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close(); } }); });
try {
  const response = await fetch('./data/schedule.json', {cache:'no-cache'});
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  data = await response.json();
  if (data.schemaVersion !== 1 || !Array.isArray(data.events) || !data.rooms?.length || !data.coverage || !data.terms || !Array.isArray(data.unresolved) || !Number.isFinite(Date.parse(data.updatedAt))) throw new Error('Geçersiz veri dosyası');
  renderCoverage(); render();
} catch (error) {
  data = undefined;
  $('plan-body').hidden=true;
  $('plan-summary').textContent='Ders programı yüklenemedi; doluluk renkleri gösterilemiyor.';
  $('results-title').textContent = 'Ders programı yüklenemedi';
  $('results').innerHTML = '<div class="empty">Veri dosyasına ulaşılamadı. Bağlantını kontrol edip sayfayı yenile.<br>Dosyaları bilgisayarında açıyorsan README’deki yerel önizleme adımını kullan.</div>';
  $('term').textContent = 'Veri bağlantısı kurulamadı'; $('updated').textContent = 'Veri yüklenemedi';
  console.error(error);
}
