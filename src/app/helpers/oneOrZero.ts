import { Bit } from "../types/bit";

export function oneOrZero(): Bit {
  return (Math.random() > 0.5 ? 1 : 0);
}
