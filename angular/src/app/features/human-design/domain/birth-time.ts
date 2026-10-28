import { BirthInput } from './models';
export function birthInstant(input: BirthInput): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.time))
    throw new Error('Вкажіть дату й точний час народження.');
  const wall = Date.parse(`${input.date}T${input.time}:00Z`);
  const date = new Date(wall);
  if (
    !Number.isFinite(wall) ||
    date.toISOString().slice(0, 16) !== `${input.date}T${input.time}` ||
    date.getUTCFullYear() < 1900 ||
    date.getUTCFullYear() > 2100
  )
    throw new Error('Підтримуються коректні дати від 1900 до 2100 року.');
  if (input.offset.trim()) {
    const m = input.offset.trim().match(/^([+-])(\d{2}):(\d{2})$/);
    if (!m || +m[2] > 14 || +m[3] > 59 || (+m[2] === 14 && +m[3] !== 0))
      throw new Error('Зсув UTC має бути у форматі +03:00 або -05:00, у межах ±14 годин.');
    const minutes = (+m[2] * 60 + +m[3]) * (m[1] === '+' ? 1 : -1);
    return new Date(wall - minutes * 60000);
  }
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: input.zone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hourCycle: 'h23',
    });
  } catch {
    throw new Error('Оберіть чинний часовий пояс, наприклад Europe/Kyiv.');
  }
  const partsAt = (time: number) => {
    const p = Object.fromEntries(formatter.formatToParts(time).map((p) => [p.type, p.value]));
    return Date.UTC(+p['year'], +p['month'] - 1, +p['day'], +p['hour'], +p['minute'], +p['second']);
  };
  const offsets = new Set<number>();
  for (let h = -36; h <= 36; h += 6) {
    const t = wall + h * 3600000;
    offsets.add(partsAt(t) - t);
  }
  const candidates = [...offsets].map((o) => wall - o).filter((t) => partsAt(t) === wall);
  if (candidates.length === 0)
    throw new Error(
      'Цього місцевого часу не існувало через переведення годинника. Перевірте запис або задайте відомий зсув UTC.',
    );
  if (candidates.length > 1)
    throw new Error(
      'Цей час повторювався при переведенні годинника. У додаткових налаштуваннях задайте зсув UTC саме на момент народження.',
    );
  return new Date(candidates[0]);
}
