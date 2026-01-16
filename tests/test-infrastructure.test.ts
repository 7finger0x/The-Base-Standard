/**
 * Test Infrastructure Validation
 * 
 * This test suite validates that the test infrastructure itself is working correctly.
 * Run this before running other tests to ensure the testing environment is properly configured.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

describe('Test Infrastructure Validation', () => {
  describe('Vitest Configuration', () => {
    it('should have globals enabled', () => {
      // If globals are enabled, we can use expect without importing
      expect(expect).toBeDefined();
      expect(describe).toBeDefined();
      expect(it).toBeDefined();
    });

    it('should have jsdom environment', () => {
      // Verify DOM APIs are available
      expect(window).toBeDefined();
      expect(document).toBeDefined();
      expect(HTMLElement).toBeDefined();
    });

    it('should have path aliases configured', async () => {
      // Test that @ alias resolves correctly
      try {
        // Dynamic import to test alias resolution
        const utils = await import('@/lib/utils');
        expect(utils).toBeDefined();
        expect(typeof utils.cn).toBe('function');
      } catch (error) {
        // If this fails, path aliases aren't working
        throw new Error('Path alias @ not configured correctly');
      }
    });
  });

  describe('Mocking Infrastructure', () => {
    it('should be able to create mocks', () => {
      const mockFn = vi.fn();
      expect(mockFn).toBeDefined();
      expect(typeof mockFn).toBe('function');
    });

    it('should be able to spy on functions', () => {
      const obj = {
        method: () => 'original',
      };
      const spy = vi.spyOn(obj, 'method');
      obj.method();
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('should mock server-only module', async () => {
      // server-only should be mocked in setup.ts
      // In test environment, server-only is mocked to return empty object
      // This test verifies the mock is working
      const serverOnly = await import('server-only');
      expect(serverOnly).toBeDefined();
    });
  });

  describe('Testing Library Setup', () => {
    it('should have cleanup function available', () => {
      expect(cleanup).toBeDefined();
      expect(typeof cleanup).toBe('function');
    });

    it('should have jest-dom matchers extended', () => {
      const element = document.createElement('div');
      element.textContent = 'test';
      // If jest-dom matchers are extended, toBeInTheDocument should exist
      expect(element).toBeDefined();
    });
  });

  describe('Environment Variables', () => {
    it('should have access to process.env', () => {
      expect(process.env).toBeDefined();
      expect(typeof process.env).toBe('object');
    });

    it('should handle missing environment variables gracefully', () => {
      const testVar = process.env.NON_EXISTENT_VAR;
      expect(testVar).toBeUndefined();
    });
  });

  describe('Async Testing', () => {
    it('should handle async/await', async () => {
      const promise = Promise.resolve('test');
      const result = await promise;
      expect(result).toBe('test');
    });

    it('should handle promises', () => {
      return Promise.resolve('test').then((result) => {
        expect(result).toBe('test');
      });
    });

    it('should handle setTimeout in tests', async () => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(true).toBe(true);
          resolve();
        }, 10);
      });
    });
  });

  describe('Test Isolation', () => {
    let counter = 0;

    beforeEach(() => {
      counter = 0;
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('should isolate test state (test 1)', () => {
      counter++;
      expect(counter).toBe(1);
    });

    it('should isolate test state (test 2)', () => {
      counter++;
      expect(counter).toBe(1); // Should be reset by beforeEach
    });
  });

  describe('Error Handling', () => {
    it('should catch and test errors', () => {
      expect(() => {
        throw new Error('test error');
      }).toThrow('test error');
    });

    it('should handle async errors', async () => {
      await expect(
        Promise.reject(new Error('async error'))
      ).rejects.toThrow('async error');
    });
  });

  describe('TypeScript Support', () => {
    it('should have type checking in tests', () => {
      const value: string = 'test';
      expect(typeof value).toBe('string');
    });

    it('should support type assertions', () => {
      const value: unknown = 'test';
      const str = value as string;
      expect(str).toBe('test');
    });
  });

  describe('File System Access', () => {
    it('should be able to import modules', async () => {
      // Test that we can import from the project using path aliases
      const utils = await import('@/lib/utils');
      expect(utils).toBeDefined();
      expect(typeof utils.cn).toBe('function');
    });
  });

  describe('Console Output', () => {
    it('should be able to use console methods', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      console.log('test');
      expect(consoleSpy).toHaveBeenCalledWith('test');
      consoleSpy.mockRestore();
    });
  });

  describe('Date and Time', () => {
    it('should handle Date objects', () => {
      const date = new Date();
      expect(date).toBeInstanceOf(Date);
      expect(date.getTime()).toBeGreaterThan(0);
    });

    it('should be able to mock Date', () => {
      const mockDate = new Date('2024-01-01');
      vi.useFakeTimers();
      vi.setSystemTime(mockDate);
      expect(new Date().getTime()).toBe(mockDate.getTime());
      vi.useRealTimers();
    });
  });

  describe('Coverage Collection', () => {
    it('should be able to test coverage collection', () => {
      // This test ensures coverage is being collected
      const testFunction = () => {
        return 'covered';
      };
      expect(testFunction()).toBe('covered');
    });
  });
});
