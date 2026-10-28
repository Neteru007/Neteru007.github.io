export type Center =
  | 'head'
  | 'ajna'
  | 'throat'
  | 'g'
  | 'ego'
  | 'spleen'
  | 'solar'
  | 'sacral'
  | 'root';
export type DesignType =
  | 'generator'
  | 'manifesting-generator'
  | 'projector'
  | 'manifestor'
  | 'reflector';
export type Authority =
  | 'emotional'
  | 'sacral'
  | 'splenic'
  | 'ego-manifested'
  | 'ego-projected'
  | 'self'
  | 'environment'
  | 'lunar';
export interface Channel {
  gates: [number, number];
  centers: [Center, Center];
  name: string;
  text: string;
}
export interface Activation {
  planet: string;
  longitude: number;
  gate: number;
  line: number;
}
export interface BirthInput {
  name: string;
  date: string;
  time: string;
  place: string;
  zone: string;
  offset: string;
}
export interface Chart {
  birth: BirthInput;
  utc: string;
  designUtc: string;
  personality: Activation[];
  design: Activation[];
  gates: number[];
  channels: Channel[];
  centers: Center[];
  groups: Center[][];
  type: DesignType;
  authority: Authority;
  profile: string;
}
