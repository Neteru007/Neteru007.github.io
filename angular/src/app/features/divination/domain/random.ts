export function randomIndex(
  max: number,
  fill: (values: Uint32Array<ArrayBuffer>) => void = (values) => {
    crypto.getRandomValues(values);
  },
): number {
  if (!Number.isInteger(max) || max < 1 || max > 4294967296)
    throw new RangeError('Invalid random bound');
  const limit = 4294967296 - (4294967296 % max);
  const buffer = new Uint32Array(1);
  do {
    fill(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}
export function drawWithoutReplacement<T>(
  items: readonly T[],
  count: number,
  random: (max: number) => number = randomIndex,
): T[] {
  if (!Number.isInteger(count) || count < 0 || count > items.length)
    throw new RangeError('Invalid draw size');
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
