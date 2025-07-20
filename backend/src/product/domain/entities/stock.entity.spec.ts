import { StockEntity } from './stock.entity';

describe('StockEntity', () => {
  describe('constructor', () => {
    it('should create stock entity with all properties', () => {
      const productId = '123';
      const quantity = 10;
      const lastUpdated = new Date('2024-01-01T10:00:00.000Z');

      const stock = new StockEntity(productId, quantity, lastUpdated);

      expect(stock.productId).toBe(productId);
      expect(stock.quantity).toBe(quantity);
      expect(stock.updatedAt).toBe(lastUpdated);

      expect(stock.isAvailable()).toBeTruthy();
      expect(stock.isOutOfStock()).toBeFalsy();
    });
  });

  describe('business rules', () => {
    it('should validate quantity', () => {
      const validQuantities = [3222, 67788, 5566666, 4444];

      validQuantities.forEach((quantity) => {
        expect(() => {
          new StockEntity('product-1', quantity);
        }).not.toThrow();
      });
    });

    it('should reject invalid quantities', () => {
      const invalidQuantities = [-3222, 14.4, -3, -24.4];

      invalidQuantities.forEach((quantity) => {
        expect(() => {
          new StockEntity('product-1', quantity);
        }).toThrow();
      });
    });

    it('should reject invalid ids', () => {
      const invalidIds = ['', ' '];

      invalidIds.forEach((id) => {
        expect(() => {
          new StockEntity(id, 10);
        }).toThrow();
      });
    });
  });
});
