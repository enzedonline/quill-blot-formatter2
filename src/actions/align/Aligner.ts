import type { Alignment } from './Alignment';
import type { Blot } from '../../specs/BlotSpec'

export interface Aligner {
  getAlignments(): Alignment[];
  isAligned(blot: Blot | null, alignment: Alignment): boolean;
  clear(blot: Blot | null): void;
}
