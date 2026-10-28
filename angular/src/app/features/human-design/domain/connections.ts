import { CHANNELS } from '../data/channels';
import { Center } from './models';

export interface Complement {
  ownGate: number;
  otherGate: number;
  channel: (typeof CHANNELS)[number];
}
export interface Bridge {
  gates: number[];
  links: [number, number][];
}

// Compare only the person's existing definition groups, without redefining their natal chart.
export function surroundings(gates: number[], groups: Center[][]) {
  const own = new Set(gates);
  const complements: Complement[] = CHANNELS.filter(
    (c) => own.has(c.gates[0]) !== own.has(c.gates[1]),
  ).map((channel) => ({
    channel,
    ownGate: own.has(channel.gates[0]) ? channel.gates[0] : channel.gates[1],
    otherGate: own.has(channel.gates[0]) ? channel.gates[1] : channel.gates[0],
  }));
  const linksWith = (added: number[]): [number, number][] => {
    const active = new Set([...gates, ...added]);
    const parent = new Map<Center, Center>();
    const find = (c: Center): Center => {
      const p = parent.get(c);
      if (!p) {
        parent.set(c, c);
        return c;
      }
      if (p === c) return c;
      const root = find(p);
      parent.set(c, root);
      return root;
    };
    for (const c of CHANNELS) {
      if (c.gates.every((g) => active.has(g))) parent.set(find(c.centers[0]), find(c.centers[1]));
    }
    const links: [number, number][] = [];
    for (let a = 0; a < groups.length; a++)
      for (let b = a + 1; b < groups.length; b++)
        if (find(groups[a][0]) === find(groups[b][0])) links.push([a + 1, b + 1]);
    return links;
  };
  if (groups.length < 2) return { complements, singles: [] as Bridge[], doubles: [] as Bridge[] };
  const missing = Array.from({ length: 64 }, (_, i) => i + 1).filter((g) => !own.has(g));
  const singleLinks = new Map(missing.map((g) => [g, linksWith([g])]));
  const singles: Bridge[] = missing
    .filter((g) => singleLinks.get(g)!.length)
    .map((g) => ({ gates: [g], links: singleLinks.get(g)! }));
  const doubles: Bridge[] = [];
  for (let i = 0; i < missing.length; i++)
    for (let j = i + 1; j < missing.length; j++) {
      const a = missing[i],
        b = missing[j];
      const independent = [...singleLinks.get(a)!, ...singleLinks.get(b)!].map((p) => p.join('-'));
      const links = linksWith([a, b]).filter((p) => !independent.includes(p.join('-')));
      if (links.length) doubles.push({ gates: [a, b], links });
    }
  return { complements, singles, doubles };
}
