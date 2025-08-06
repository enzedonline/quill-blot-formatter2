import type { Alignment } from './Alignment';
import type { Blot } from '../../specs/BlotSpec';

/**
 * Interface for objects that handle alignment operations on blots.
 *
 * Implementations of this interface provide methods to retrieve available alignments,
 * check if a blot is aligned to a specific alignment, and clear alignment from a blot.
 */
export interface Aligner {
  getAlignments(): Alignment[];
  isAligned(blot: Blot | null, alignment: Alignment): boolean;
  clear(blot: Blot | null): void;
}
