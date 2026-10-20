import { DAYS, minutes, clock, overlaps, roomState, validRange, dayOfDate, istanbulNow } from './core.mjs';
const $ = id => document.getElementById(id);
const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data, filter = 'free', favorites = new Set(), selectedRoom;
try { const saved = JSON.parse(localStorage.getItem('taskisla-favorites') || '[]'); if (Array.isArray(saved)) favorites = new Set(saved.filter(x => typeof x === 'string')); } catch {}
const dateLabel = value => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`));
function setNow() {
  const now = istanbulNow();
  $('date').value = now.date;
  $('start').value = now.time;
  $('end').value = clock(Math.min(minutes(now.time) + 60, 1439));
  if (minutes(now.time) === 1439) { $('start').value = '23:58'; $('end').value = '23:59'; }
}
function range() { return {day: dayOfDate($('date').value), start: minutes($('start').value), end: minutes($('end').value)}; }
function renderDays() {
  const day = dayOfDate($('date').value);
  $('days').innerHTML = DAYS.map((name, index) => `<button data-day="${index}" aria-pressed="${index === day}">${name}</button>`).join('');
}
function kind(room) { return /^\d/.test(room) || /^D\d/.test(room) ? 'DERSLİK' : 'STÜDYO / ÖZEL ALAN'; }
function timeline(meetings, start, end) {
  const position = n => Math.max(0, Math.min(100, (n - 480) / 720 * 100));
  const bar = (s, e, cls) => `<span class="${cls}" style="left:${position(s)}%;width:${Math.max(0, position(e) - position(s))}%"></span>`;
  return `<div class="timeline" aria-hidden="true">${meetings.map(e => bar(e.start, e.end, 'event')).join('')}${bar(start, end, 'chosen')}</div><div class="timeline-labels" aria-hidden="true"><span>08.00</span><span>14.00</span><span>20.00</span></div>`;
}
function render() {
  renderDays();
  if (!data) return;
  const {day, start, end} = range();
  const valid = $('date').value && Number.isInteger(day) && validRange(start, end);
  $('input-error').hidden = Boolean(valid);
  $('input-error').textContent = 'Geçerli bir tarih ve aynı gün içinde, başlangıçtan sonraki bir bitiş saati seçin.';
  document.querySelectorAll('#presets button').forEach(b => b.setAttribute('aria-pressed', String(end - start === Number(b.dataset.min))));
  document.querySelectorAll('#filters button').forEach(b => b.setAttribute('aria-pressed', String(filter === b.dataset.filter)));
  if (!valid) {
    $('results').innerHTML = '<p class="empty">Sonuçları görmek için tarih ve saat aralığını düzeltin.</p>';
    $('results-title').textContent = 'Saat aralığını kontrol et';
    for (const id of ['free-count', 'all-count', 'busy-count']) $(id).textContent = '—';
    return;
  }
  const states = data.rooms.map(room => ({room, ...roomState(data.events, room, day, start, end)}));
  const free = states.filter(s => s.free).length;
  $('free-count').textContent = free;
  $('all-count').textContent = states.length;
  $('busy-count').textContent = states.length - free;
  $('selection-label').textContent = `${dateLabel($('date').value).toLocaleUpperCase('tr-TR')} · ${DAYS[day].toLocaleUpperCase('tr-TR')} · ${clock(start)}–${clock(end)}`;
  $('results-title').textContent = `${free} derslik programda boş görünüyor`;
  const search = $('search').value.trim().toLocaleUpperCase('tr-TR');
  const shown = states.filter(s => (filter === 'all' || (filter === 'free' && s.free) || (filter === 'busy' && !s.free) || (filter === 'saved' && favorites.has(s.room))) && s.room.toLocaleUpperCase('tr-TR').includes(search));
  shown.sort((a, b) => a.room.localeCompare(b.room, 'tr', {numeric:true}));
  $('results').innerHTML = shown.length ? shown.map(s => {
    const info = s.free ? (s.next ? `${clock(s.next.start)}’a kadar programda ders yok` : 'Seçilen saatten sonra kayıtlı ders yok') : `${s.conflicts.map(e => e.code).filter((x,i,a) => a.indexOf(x) === i).join(' · ')}`;
    return `<article class="room-card ${s.free ? '' : 'busy'} ${s.room.length > 5 ? 'long' : ''}"><div class="room-top"><span class="room-kind">MMB / ${kind(s.room)}</span><button class="favorite" data-save="${escape(s.room)}" aria-label="${escape(s.room)} dersliğini ${favorites.has(s.room) ? 'favorilerden çıkar' : 'kaydet'}" aria-pressed="${favorites.has(s.room)}">${favorites.has(s.room) ? '♥' : '♡'}</button></div><div class="room-name"><h3>${escape(s.room)}</h3><span class="status">${s.free ? '● Programda boş' : '● Ders var'}</span></div><p class="room-info" title="${escape(info)}">${escape(info)}</p>${timeline(s.meetings, start, end)}<button class="card-bottom" data-room="${escape(s.room)}"><span>Haftalık programa bak</span><b aria-hidden="true">↗</b></button></article>`;
  }).join('') : `<div class="empty">${filter === 'saved' && !favorites.size ? 'Henüz kaydedilen derslik yok.<br>Derslik kartındaki kalbe dokunarak kaydet.' : 'Bu filtrelerle eşleşen derslik bulunamadı.<br>Saat aralığını veya arama metnini değiştirebilirsin.'}</div>`;
  $('scope-note').textContent = `${shown.length} / ${states.length} derslik gösteriliyor. Derslik listesi, seçilen kodlarda en az bir MMB oturumu bulunan mekânlardan oluşur. Saatler İstanbul saatidir; tarih seçimi haftanın gününe ait tekrarlayan programı gösterir.`;
  const missing = data.coverage.filter(c => c.status !== 'ok');
  const warnings = [];
  if (missing.length) warnings.push(`${missing.map(c => c.code).join(', ')} şu an OBS seçim listesinde yok.`);
  if (data.unresolved.length) warnings.push(`${data.unresolved.length} MMB oturumunun gün, saat veya derslik bilgisi eksik; bu oturumlar doluluk hesabına katılamadı.`);
  if (new Date($('date').value + 'T12:00:00') > new Date(Date.now() + 90 * 86400000) || new Date($('date').value + 'T12:00:00') < new Date(Date.now() - 90 * 86400000)) warnings.push('Seçilen tarih, güncel programdan uzak. Dönem ve tatil tarihlerini OBS’den kontrol et.');
  $('notice').hidden = !warnings.length;
  $('notice').innerHTML = warnings.map(escape).join(' ') + ' <button id="coverage-link">Kapsamı incele ↗</button>';
  $('coverage-link')?.addEventListener('click', () => $('coverage').showModal());
}
function openRoom(room) {
  selectedRoom = room;
  $('detail-title').textContent = `${room} · Haftalık program`;
  const current = range();
  $('detail-content').innerHTML = `<p class="dialog-note">${escape(data.terms.LS)} · ${dateLabel($('date').value)} haftası için tekrarlayan ders programı. Seçilen aralık: ${DAYS[current.day]}, ${clock(current.start)}–${clock(current.end)}. Özel rezervasyonları kapsamaz.</p>` + DAYS.map((day, i) => {
    const meetings = data.events.filter(e => e.room === selectedRoom && e.day === i).sort((a,b) => a.start - b.start);
    return `<section class="day-section"><h3>${day}${i === current.day ? ' · Seçilen gün' : ''}</h3>${meetings.length ? meetings.map(e => `<div class="meeting"><time>${clock(e.start)}–${clock(e.end)}</time><div><strong>${escape(e.code)}</strong> · ${escape(e.name)}<span>${e.level === 'LS' ? 'Lisans' : 'Lisansüstü'} · CRN ${escape(e.crn)}${overlaps(e, current.day, current.start, current.end) ? ' · Seçilen saatle çakışıyor' : ''}</span></div></div>`).join('') : '<p class="dialog-note">Taranan programda kayıtlı ders yok.</p>'}</section>`;
  }).join('');
  $('detail').showModal();
}
function renderCoverage() {
  const updated = new Intl.DateTimeFormat('tr-TR', {timeZone:'Europe/Istanbul',dateStyle:'long',timeStyle:'short'}).format(new Date(data.updatedAt));
  $('term').textContent = `${data.terms.LS} · ${data.rooms.length} derslik`;
  $('updated').textContent = `Son veri: ${updated}`;
  $('coverage-content').innerHTML = `<p class="dialog-note">Kaynak: <a href="${escape(data.source)}" target="_blank" rel="noopener noreferrer"><u>İTÜ OBS Ders Programı ↗</u></a><br>Son başarılı tarama: ${updated} (İstanbul).<br>${data.events.length} MMB ders oturumu · ${data.rooms.length} farklı mekân.<br>Bu sürüm sabit bir ders programı kullanır; otomatik güncellenmez. Sayfayı yenilemek OBS’den yeni veri getirmez. Program değişirse veya yeni dönem başlarsa veri dosyasını yenilemek gerekir.</p><p class="dialog-note">Tarih seçimi tatil, sınav haftası veya dönem başlangıcı/bitişi kontrolü yapmaz. Güncel dönem programını seçtiğiniz haftanın gününe uygular. OBS’de 12:29 gibi belirtilen son dakikalar dahildir; uygulama bu dersi 12:30’a kadar dolu sayar.</p><table><thead><tr><th>Düzey</th><th>Kod</th><th>Ders satırı</th><th>MMB oturumu</th></tr></thead><tbody>${data.coverage.map(c => `<tr><td>${c.level === 'LS' ? 'Lisans' : 'Lisansüstü'}</td><td>${escape(c.code)}</td><td>${c.status === 'ok' ? c.rows : 'Listede yok'}</td><td>${c.status === 'ok' ? c.meetings : '—'}</td></tr>`).join('')}</tbody></table><p class="dialog-note">0 MMB oturumu, o kodda bu taramada dersliği ve saati belirli bir MMB kaydı bulunmadığını ifade eder. Diğer binalardaki oturumlar hesaba katılmaz.</p><details><summary>Eksik bilgili ${data.unresolved.length} MMB oturumu</summary>${data.unresolved.map(e => `<p class="dialog-note">${escape(e.code)} · CRN ${escape(e.crn)} · ${escape(e.day)} · ${escape(e.time)} · Derslik: ${escape(e.room || 'Belirtilmemiş')}</p>`).join('')}</details>`;
}
setNow();
renderDays();
for (const id of ['date', 'start', 'end', 'search']) $(id).addEventListener('input', render);
$('now').addEventListener('click', () => { setNow(); render(); });
$('presets').addEventListener('click', e => { const b = e.target.closest('[data-min]'); if (!b) return; const start = minutes($('start').value); if (Number.isNaN(start)) return; $('end').value = clock(Math.min(start + Number(b.dataset.min), 1439)); render(); });
$('days').addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (!b || !$('date').value) return; const d = new Date($('date').value + 'T12:00:00'); d.setDate(d.getDate() + Number(b.dataset.day) - dayOfDate($('date').value)); $('date').value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; render(); });
$('filters').addEventListener('click', e => { const b = e.target.closest('[data-filter]'); if (!b) return; filter = b.dataset.filter; render(); });
$('results').addEventListener('click', e => {
  const save = e.target.closest('[data-save]');
  if (save) { const room = save.dataset.save; favorites.has(room) ? favorites.delete(room) : favorites.add(room); try { localStorage.setItem('taskisla-favorites', JSON.stringify([...favorites])); } catch {} render(); return; }
  const button = e.target.closest('[data-room]'); if (button) openRoom(button.dataset.room);
});
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
  $('results-title').textContent = 'Ders programı yüklenemedi';
  $('results').innerHTML = '<div class="empty">Veri dosyasına ulaşılamadı. Bağlantını kontrol edip sayfayı yenile.<br>Dosyaları bilgisayarında açıyorsan README’deki yerel önizleme adımını kullan.</div>';
  $('term').textContent = 'Veri bağlantısı kurulamadı'; $('updated').textContent = 'Veri yüklenemedi';
  console.error(error);
}
