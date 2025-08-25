/**
 * Tests for the centralized logging utility
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger } from '../logger';

// Mock console methods
const mockConsole = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

beforeEach(() => {
  vi.stubGlobal('console', mockConsole);
  // Reset all mocks
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Logger', () => {
  describe('in development mode', () => {
    beforeEach(() => {
      vi.stubEnv('MODE', 'development');
    });

    it('should log debug messages', () => {
      logger.debug('Test debug message', { module: 'test' });
      
      expect(mockConsole.debug).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG][test]'),
        'Test debug message',
        { module: 'test' }
      );
    });

    it('should log info messages', () => {
      logger.info('Test info message', { module: 'test', component: 'TestComponent' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO][test::TestComponent]'),
        'Test info message',
        { module: 'test', component: 'TestComponent' }
      );
    });

    it('should log warn messages', () => {
      logger.warn('Test warning', { module: 'test' });
      
      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN][test]'),
        'Test warning',
        { module: 'test' }
      );
    });

    it('should log error messages', () => {
      logger.error('Test error', { module: 'test' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR][test]'),
        'Test error',
        { module: 'test' }
      );
    });

    it('should handle context without module', () => {
      logger.info('Test message', { component: 'TestComponent' });
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO][App::TestComponent]'),
        'Test message',
        { component: 'TestComponent' }
      );
    });

    it('should handle no context', () => {
      logger.info('Test message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Test message',
        undefined
      );
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      vi.stubEnv('MODE', 'production');
    });

    it('should not log debug messages', () => {
      logger.debug('Test debug message', { module: 'test' });
      expect(mockConsole.debug).not.toHaveBeenCalled();
    });

    it('should not log info messages', () => {
      logger.info('Test info message', { module: 'test' });
      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('should not log warn messages', () => {
      logger.warn('Test warning', { module: 'test' });
      expect(mockConsole.warn).not.toHaveBeenCalled();
    });

    it('should still log error messages', () => {
      logger.error('Test error', { module: 'test' });
      
      expect(mockConsole.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR][test]'),
        'Test error',
        { module: 'test' }
      );
    });
  });

  describe('legacy compatibility', () => {
    beforeEach(() => {
      vi.stubEnv('MODE', 'development');
    });

    it('should support legacy log method', () => {
      logger.info('Legacy message');
      
      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO]'),
        'Legacy message',
        undefined
      );
    });
  });
});