import type { Blot } from '../../specs/BlotSpec'

export type Alignment = {
  name: string,
  icon: string;
  apply: (blot: Blot | null) => void;
}
