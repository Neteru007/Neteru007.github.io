export interface EscapeBounds {
  width: number;
  height: number;
  buttonWidth: number;
  buttonHeight: number;
  pointerX: number;
  pointerY: number;
}
export function escapePosition(
  bounds: EscapeBounds,
  random: () => number = Math.random,
): { x: number; y: number } {
  const { width, height, buttonWidth, buttonHeight, pointerX, pointerY } = bounds;
  const padding = 8;
  const maxX = Math.max(0, width - buttonWidth),
    maxY = Math.max(0, height - buttonHeight);
  const minX = Math.min(padding, maxX),
    minY = Math.min(padding, maxY);
  let x = minX,
    y = minY,
    best = -1;
  for (let i = 0; i < 24; i++) {
    const nx = minX + random() * Math.max(0, maxX - minX - padding),
      ny = minY + random() * Math.max(0, maxY - minY - padding);
    const distance = Math.hypot(nx + buttonWidth / 2 - pointerX, ny + buttonHeight / 2 - pointerY);
    if (distance > best) {
      best = distance;
      x = nx;
      y = ny;
    }
  }
  return { x, y };
}
