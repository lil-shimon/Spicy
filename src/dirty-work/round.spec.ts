import { describe, it, expect } from 'vitest';
import { roundDown, roundUp } from './round';

describe('round', () => {
  describe('roundDown', () => {
    it('should round down to tick multiple', () => {
      const result = roundDown(99.9517, 0.001);
      expect(result).toBeCloseTo(99.951, 6);
    });

    it('should remain unchanged when price is exact tick multiple', () => {
      const result = roundDown(99.95, 0.001);
      expect(result).toBeCloseTo(99.95, 6);
    });

    it('should handle zero price', () => {
      const result = roundDown(0, 0.001);
      expect(result).toBe(0);
    });

    it('should handle negative price', () => {
      const result = roundDown(-99.9517, 0.001);
      expect(result).toBeCloseTo(-99.952, 6);
    });

    it('should handle large tick size', () => {
      const result = roundDown(99.9517, 1);
      expect(result).toBe(99);
    });

    it('should handle very small tick size', () => {
      const result = roundDown(99.123456789, 0.000001);
      expect(result).toBeCloseTo(99.123456, 6);
    });

    it('should handle decimal precision correctly', () => {
      const result = roundDown(1.2345, 0.01);
      expect(result).toBeCloseTo(1.23, 6);
    });
  });

  describe('roundUp', () => {
    it('should round up to tick multiple', () => {
      const result = roundUp(99.9517, 0.001);
      expect(result).toBeCloseTo(99.952, 6);
    });

    it('should remain unchanged when price is exact tick multiple', () => {
      const result = roundUp(99.95, 0.001);
      expect(result).toBeCloseTo(99.95, 6);
    });

    it('should handle zero price', () => {
      const result = roundUp(0, 0.001);
      expect(result).toBe(0);
    });

    it('should handle negative price', () => {
      const result = roundUp(-99.9517, 0.001);
      expect(result).toBeCloseTo(-99.951, 6);
    });

    it('should handle large tick size', () => {
      const result = roundUp(99.9517, 1);
      expect(result).toBe(100);
    });

    it('should handle very small tick size', () => {
      const result = roundUp(99.123456789, 0.000001);
      expect(result).toBeCloseTo(99.123457, 6);
    });

    it('should handle decimal precision correctly', () => {
      const result = roundUp(1.2345, 0.01);
      expect(result).toBeCloseTo(1.24, 6);
    });
  });
});
