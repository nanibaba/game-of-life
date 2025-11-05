import { getCell, createNextGeneration } from './cellHandler';
import { BitArray } from '../types/bit';

describe('cellHandler', () => {
  describe('getCell', () => {
    const board: BitArray[] = [
      [1, 0, 1],
      [0, 1, 0],
      [1, 0, 1]
    ];
    const rows = 3;
    const cols = 3;

    it('should return correct cell within bounds', () => {
      expect(getCell(rows, cols, board, 1, 1)).toBe(1);
      expect(getCell(rows, cols, board, 0, 1)).toBe(0);
    });

    it('should wrap around horizontally', () => {
      expect(getCell(rows, cols, board, 1, -1)).toBe(board[1][2]); // Left edge wraps
      expect(getCell(rows, cols, board, 1, 3)).toBe(board[1][0]);  // Right edge wraps
    });

    it('should wrap around vertically', () => {
      expect(getCell(rows, cols, board, -1, 1)).toBe(board[2][1]); // Top edge wraps
      expect(getCell(rows, cols, board, 3, 1)).toBe(board[0][1]);  // Bottom edge wraps
    });

    it('should wrap around corners', () => {
      expect(getCell(rows, cols, board, -1, -1)).toBe(board[2][2]); // Top-left corner
      expect(getCell(rows, cols, board, -1, 3)).toBe(board[2][0]);  // Top-right corner
      expect(getCell(rows, cols, board, 3, -1)).toBe(board[0][2]);  // Bottom-left corner
      expect(getCell(rows, cols, board, 3, 3)).toBe(board[0][0]);   // Bottom-right corner
    });
  });

  describe('createNextGeneration', () => {
    it('should apply underpopulation rule (fewer than 2 neighbors die)', () => {
      const board: BitArray[] = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
      ];
      const next = createNextGeneration(board, 3, 3);
      expect(next[1][1]).toBe(0); // Center cell dies
    });

    it('should apply survival rule (2 or 3 neighbors live)', () => {
      const board: BitArray[] = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ];
      const next = createNextGeneration(board, 3, 3);
      expect(next[1][1]).toBe(1); // Center cell survives with 2 neighbors
    });

    it('should apply overpopulation rule (more than 3 neighbors die)', () => {
      const board: BitArray[] = [
        [1, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ];
      const next = createNextGeneration(board, 3, 3);
      expect(next[1][1]).toBe(0); // Center cell dies from overcrowding
    });

    it('should apply reproduction rule (dead cell with 3 neighbors becomes alive)', () => {
      const board: BitArray[] = [
        [1, 1, 0],
        [0, 0, 0],
        [1, 0, 0]
      ];
      const next = createNextGeneration(board, 3, 3);
      expect(next[1][1]).toBe(1); // Center cell becomes alive
    });

    it('should preserve original board state', () => {
      const board: BitArray[] = [
        [1, 1, 0],
        [0, 0, 0],
        [1, 0, 0]
      ];
      const originalBoard = board.map(row => [...row]);
      createNextGeneration(board, 3, 3);
      expect(board).toEqual(originalBoard);
    });

    it('should handle empty board', () => {
      const board: BitArray[] = [];
      const next = createNextGeneration(board, 0, 0);
      expect(next).toEqual([]);
    });

    it('should handle stable pattern (block)', () => {
      const board: BitArray[] = [
        [0, 0, 0, 0],
        [0, 1, 1, 0],
        [0, 1, 1, 0],
        [0, 0, 0, 0]
      ];
      const next = createNextGeneration(board, 4, 4);
      expect(next).toEqual(board);
    });
  });
});