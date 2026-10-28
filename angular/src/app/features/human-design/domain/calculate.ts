import {
  Body,
  Ecliptic,
  GeoVector,
  GeoMoonState,
  RotateVector,
  Rotation_EQJ_ECT,
  Vector,
} from 'astronomy-engine';
import { CHANNELS } from '../data/channels';
import { Activation, Authority, BirthInput, Center, Chart, DesignType } from './models';
import { birthInstant } from './birth-time';
export const GATE_ORDER = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45,
  12, 15, 52, 39, 53, 62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44,
  1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];
const norm = (n: number) => ((n % 360) + 360) % 360;
export function gateAt(longitude: number): { gate: number; line: number } {
  if (!Number.isFinite(longitude)) throw new Error('Некоректна довгота.');
  const position = norm(longitude - 302) / 5.625;
  return {
    gate: GATE_ORDER[Math.floor(position)],
    line: Math.min(6, Math.floor((position % 1) * 6) + 1),
  };
}
export function longitude(body: Body, date: Date): number {
  return Ecliptic(GeoVector(body, date, true)).elon;
}
// Ascending osculating lunar node from the instantaneous orbital angular momentum.
export function lunarNode(date: Date): number {
  const s = GeoMoonState(date),
    rot = Rotation_EQJ_ECT(date);
  const r = RotateVector(rot, new Vector(s.x, s.y, s.z, s.t));
  const v = RotateVector(rot, new Vector(s.vx, s.vy, s.vz, s.t));
  const hx = r.y * v.z - r.z * v.y,
    hy = r.z * v.x - r.x * v.z;
  return norm((Math.atan2(hx, -hy) * 180) / Math.PI);
}
export function designInstant(birth: Date): Date {
  const target = longitude(Body.Sun, birth);
  let lo = birth.getTime() - 100 * 86400000,
    hi = birth.getTime() - 70 * 86400000;
  for (let i = 0; i < 42; i++) {
    const mid = (lo + hi) / 2;
    if (norm(target - longitude(Body.Sun, new Date(mid))) > 88) lo = mid;
    else hi = mid;
  }
  return new Date(Math.round((lo + hi) / 2));
}
export function activations(date: Date): Activation[] {
  const sun = longitude(Body.Sun, date),
    node = lunarNode(date);
  const positions: [string, number][] = [
    ['Сонце', sun],
    ['Земля', norm(sun + 180)],
    ['Північний вузол', node],
    ['Південний вузол', norm(node + 180)],
    ['Місяць', longitude(Body.Moon, date)],
  ];
  for (const [name, body] of [
    ['Меркурій', Body.Mercury],
    ['Венера', Body.Venus],
    ['Марс', Body.Mars],
    ['Юпітер', Body.Jupiter],
    ['Сатурн', Body.Saturn],
    ['Уран', Body.Uranus],
    ['Нептун', Body.Neptune],
    ['Плутон', Body.Pluto],
  ] as const)
    positions.push([name, longitude(body, date)]);
  return positions.map(([planet, longitude]) => ({ planet, longitude, ...gateAt(longitude) }));
}
export function definition(gates: number[]) {
  const active = new Set(gates),
    channels = CHANNELS.filter((c) => c.gates.every((g) => active.has(g)));
  const centers = [...new Set(channels.flatMap((c) => c.centers))];
  const connected = (start: Center): Center[] => {
    const seen = new Set<Center>([start]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of channels)
        if (c.centers.some((x) => seen.has(x)))
          for (const x of c.centers)
            if (!seen.has(x)) {
              seen.add(x);
              changed = true;
            }
    }
    return [...seen];
  };
  const groups: Center[][] = [];
  for (const c of centers) if (!groups.some((g) => g.includes(c))) groups.push(connected(c));
  const throat = centers.includes('throat') ? connected('throat') : [];
  const motorThroat = (['ego', 'solar', 'sacral', 'root'] as Center[]).some((c) =>
    throat.includes(c),
  );
  let type: DesignType;
  if (centers.includes('sacral')) type = motorThroat ? 'manifesting-generator' : 'generator';
  else if (motorThroat) type = 'manifestor';
  else type = centers.length ? 'projector' : 'reflector';
  let authority: Authority;
  if (centers.includes('solar')) authority = 'emotional';
  else if (centers.includes('sacral')) authority = 'sacral';
  else if (centers.includes('spleen')) authority = 'splenic';
  else if (centers.includes('ego'))
    authority = type === 'manifestor' ? 'ego-manifested' : 'ego-projected';
  else if (throat.includes('g')) authority = 'self';
  else authority = type === 'reflector' ? 'lunar' : 'environment';
  return { channels, centers, groups, type, authority };
}
export function calculate(birth: BirthInput): Chart {
  const utc = birthInstant(birth);
  if (utc.getTime() > Date.now()) throw new Error('Дата народження не може бути в майбутньому.');
  const designUtc = designInstant(utc),
    personality = activations(utc),
    design = activations(designUtc);
  const gates = [...new Set([...personality, ...design].map((a) => a.gate))].sort((a, b) => a - b);
  return {
    birth: { ...birth },
    utc: utc.toISOString(),
    designUtc: designUtc.toISOString(),
    personality,
    design,
    gates,
    profile: `${personality[0].line}/${design[0].line}`,
    ...definition(gates),
  };
}
