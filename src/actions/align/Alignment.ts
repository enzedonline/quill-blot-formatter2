import type { Blot } from '../../specs/BlotSpec'

/**
 * Represents an alignment action that can be applied to a Blot.
 *
 * @property name - The name of the alignment (e.g., "left", "center", "right").
 * @property apply - A function that applies the alignment to the given Blot instance.
 *                   If the provided Blot is null, the function should handle it gracefully.
 */
export type Alignment = {
  name: string,
  apply: (blot: Blot | null) => void;
}
