// Utilities for computing the Game of Life next generation.
//
// The module exports two functions:
// - getCell: returns the value of a cell using toroidal (wrap-around)
//   addressing so that the board behaves as if its edges are connected.
// - createNextGeneration: computes the next board state from a given
//   board using Conway's Game of Life rules.
import { BitArray, Bit } from "../types/bit";

/**
 * Get the value of a board cell using wrap-around indices.
 *
 * Parameters:
 * - rows, cols: the dimensions of the board (number of rows/columns).
 * - board: the 2D BitArray representing the current board state.
 * - cell_r, cell_c: the (possibly out-of-range) coordinates to read.
 *
 * Behavior:
 * - We use modular arithmetic so negative indices or indices beyond the
 *   borders will "wrap" around to the other side. This implements a
 *   torus topology (donut-shaped board) and avoids special-casing edges.
 */
export function getCell(
  rows: number,
  cols: number,
  board: BitArray[],
  cell_r: number,
  cell_c: number
): Bit {
  // Wrap row & column indices into valid ranges [0, rows-1] and [0, cols-1]
  // The (index + size) % size trick ensures negative indices wrap
  // correctly as well (e.g., -1 -> size - 1).
  const row = (cell_r + rows) % rows;
  const col = (cell_c + cols) % cols;
  return board[row][col];
}

/**
 * Create the next generation board using Conway's rules.
 *
 * Implementation notes:
 * - We create a shallow clone of each row as the starting point for
 *   `next` (via `board.map(row => [...row])`). This produces a
 *   separate 2D array so we don't mutate the input while calculating
 *   neighbor counts. Each element is a number (0 or 1).
 * - For each cell we count the number of live neighbors by checking the
 *   8 surrounding positions. We skip the center cell itself when
 *   counting.
 * - Rules applied:
 *   - A live cell (1) survives if it has 2 or 3 live neighbors.
 *   - A dead cell (0) becomes alive (born) if it has exactly 3 neighbors.
 *   - Otherwise, the cell becomes/stays dead.
 *
 * Performance notes / alternatives:
 * - This implementation is straightforward and easy to read. For large
 *   boards you might consider optimizing by tracking only changed cells.
 *
 * Current complexity:
 * - Time: O(rows × cols × 8) = O(n) per generation (where n = total cells).
 *   We visit every cell and check 8 neighbors for each, but the 8 is constant.
 * - Space: O(rows × cols) to store the copy of the board.
 *
 * Optimization strategies for even larger boards - Sparse/dirty-set tracking:
 *    - Most cells don't change between generations. In stable
 *      regions, patterns remain static; only boundary cells of clusters change.
 *    - Maintain a set of "dirty" cells (those that changed or could
 *      affect neighbors). Only recompute cells adjacent to dirty cells.
 *    - Benefit: On sparse boards (few live cells), reduces work from O(n) to
 *      O(living_cells + neighbors_of_living_cells), which is often << O(n).
 */
export function createNextGeneration(
  board: BitArray[],
  rows: number,
  cols: number
): BitArray[] {
  // Create a copy of the board as the base for the next generation.
  // Using map + spread clones the rows so assignments
  // to next[y][x] don't mutate the input board while iterating.
  const next: BitArray[] = board.map(row => [...row]);

  // Iterate every cell on the board and compute its next state.
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Count live neighbors in the 3x3 area around (y, x), excluding
      // the center cell itself.
      // The loops use dy/dx in -1..1 to visit the 3×3 neighborhood
      // (row above/current/below × column left/current/right). We skip
      // the (0,0) offset because that would refer to the cell itself.
      let liveNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          // Skip the cell itself; we only want surrounding cells.
          if (dy === 0 && dx === 0) continue;
          // Use getCell which handles wrap-around edges.
          liveNeighbors += getCell(rows, cols, board, y + dy, x + dx);
        }
      }

      const cell = board[y][x];
      // Determine if the cell survives or is born according to Conway's rules.
      const survives = cell === 1 && (liveNeighbors === 2 || liveNeighbors === 3);
      const born = cell === 0 && liveNeighbors === 3;
      // If survives or born -> 1 else -> 0
      next[y][x] = survives || born ? 1 : 0;
    }
  }

  return next;
}
