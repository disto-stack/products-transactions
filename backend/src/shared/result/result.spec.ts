import { success, failure } from './result';

describe('Result', () => {
  describe('success', () => {
    it('should create success result', () => {
      const result = success('test value');

      expect(result.isSuccess()).toBe(true);
      expect(result.isFailure()).toBe(false);
      expect(result.value).toBe('test value');
    });

    it('should chain operations with bind', () => {
      const result = success(5)
        .bind(x => success(x * 2))
        .bind(x => success(x.toString()));

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe('10');
      }
    });

    it('should transform with map', () => {
      const result = success('hello')
        .map(x => x.toUpperCase())
        .map(x => x.length);

      expect(result.isSuccess()).toBe(true);
      if (result.isSuccess()) {
        expect(result.value).toBe(5);
      }
    });
  });

  describe('failure', () => {
    it('should create failure result', () => {
      const result = failure('error message');

      expect(result.isSuccess()).toBe(false);
      expect(result.isFailure()).toBe(true);
      expect(result.error).toBe('error message');
    });

    it('should not execute bind on failure', () => {
      const mockFn = jest.fn();

      const result = failure('error')
        .bind(x => {
          mockFn();
          return success(x);
        });

      expect(result.isFailure()).toBe(true);
      if (result.isFailure()) {
        expect(result.error).toBe('error');
      }
      expect(mockFn).not.toHaveBeenCalled();
    });

  });
});