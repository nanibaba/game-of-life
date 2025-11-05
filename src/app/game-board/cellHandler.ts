import { BitArray, Bit } from "../types/bit";

export function getCell(
  rows: number,
  cols: number,
  board: BitArray[],
  cell_r: number,
  cell_c: number
): Bit {
  const row = (cell_r + rows) % rows;
  const col = (cell_c + cols) % cols;
  return board[row][col];
}

export function createNextGeneration(
  board: BitArray[],
  rows: number,
  cols: number
): BitArray[] {
  const next: BitArray[] = board.map(row => [...row]);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let liveNeighbors = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dy === 0 && dx === 0) continue;
          liveNeighbors += getCell(rows, cols, board, y + dy, x + dx);
        }
      }
      const cell = board[y][x];
      const survives = cell === 1 && (liveNeighbors === 2 || liveNeighbors === 3);
      const born = cell === 0 && liveNeighbors === 3;
      next[y][x] = survives || born ? 1 : 0;
    }
  }
  return next;
}
