import { oneOrZero } from './oneOrZero';

describe('oneOrZero', () => {
  it('should only return 0 or 1', () => {
    for (let i = 0; i < 100; i++) {
      const result = oneOrZero();
      expect([0, 1]).toContain(result);
    }
  });

  it('should return a number type', () => {
    const result = oneOrZero();
    expect(typeof result).toBe('number');
  });
});
