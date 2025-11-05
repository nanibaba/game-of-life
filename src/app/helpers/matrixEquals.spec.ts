import { matrixEquals } from './matrixEquals';

describe('matrixEquals', () => {
  it('should return true for identical matrices', () => {
    const a = [[1, 0], [0, 1]];
    const b = [[1, 0], [0, 1]];
    expect(matrixEquals(a, b)).toBe(true);
  });

  it('should return false for matrices with different values', () => {
    const a = [[1, 0], [0, 1]];
    const b = [[1, 0], [1, 1]];
    expect(matrixEquals(a, b)).toBe(false);
  });

  it('should return false for matrices with different row counts', () => {
    const a = [[1, 0], [0, 1]];
    const b = [[1, 0]];
    expect(matrixEquals(a, b)).toBe(false);
  });

  it('should return false for matrices with different column counts', () => {
    const a = [[1, 0], [0, 1]];
    const b = [[1, 0, 1], [0, 1, 0]];
    expect(matrixEquals(a, b)).toBe(false);
  });

  it('should handle empty matrices', () => {
    expect(matrixEquals([], [])).toBe(true);
  });

  it('should handle large matrices', () => {
    const size = 100;
    const a = Array(size).fill(Array(size).fill(1));
    const b = Array(size).fill(Array(size).fill(1));
    expect(matrixEquals(a, b)).toBe(true);
  });
});