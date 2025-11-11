// This helper returns a random bit (0 or 1) and is used to initialize
// the game board with a semi-random starting pattern.
//
// The project defines a `Bit` type (see `src/app/types/bit.ts`) which
// is an alias for the number values 0 or 1. Importing it here allows
// TypeScript to check that the function returns the expected value.
import { Bit } from "../types/bit";

/**
 * Return either 0 or 1 at random.
 *
 * Implementation details and rationale:
 * - We use Math.random() which returns a floating point number in [0, 1).
 * - The threshold 0.5 is arbitrary but gives an approximately 50/50
 *   distribution of zeros and ones for the initial board state.
 * - The returned value is explicitly typed as `Bit` so consumers know
 *   they receive a 0/1 value and not an arbitrary number.
 */
export function oneOrZero(): Bit {
  // If the random value is greater than 0.5 return 1, otherwise 0.
  // The ternary ensures we always return the numeric Bit type.
  return (Math.random() > 0.5 ? 1 : 0);
}
