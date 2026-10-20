export const DAYS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
export function minutes(value) { const [h, m] = value.split(':').map(Number); return h * 60 + m; }
export function clock(value) { return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`; }
export function overlaps(event, day, start, end) { return event.day === day && event.start < end && event.end > start; }
export function roomState(events, room, day, start, end) {
  const meetings = events.filter(e => e.room === room && e.day === day).sort((a, b) => a.start - b.start);
  const conflicts = meetings.filter(e => overlaps(e, day, start, end));
  const next = meetings.find(e => e.start >= end);
  return { meetings, conflicts, next, free: conflicts.length === 0 };
}
export function validRange(start, end) { return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end <= 1440 && end > start; }
export function dayOfDate(value) { return (new Date(`${value}T12:00:00`).getDay() + 6) % 7; }
export function istanbulNow(date = new Date()) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(date).map(p => [p.type, p.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}
