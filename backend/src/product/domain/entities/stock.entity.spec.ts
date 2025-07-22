import { StockEntity } from './stock.entity';

describe('StockEntity', () => {
  describe('constructor', () => {
    it('should create stock entity with all properties', () => {
      const productId = 'product-1';
      const quantity = 50;
      const reserved = 10;
      const updatedAt = new Date('2024-01-01T10:00:00.000Z');

      const stock = new StockEntity(productId, quantity, reserved, updatedAt);

      expect(stock.productId).toBe(productId);
      expect(stock.quantity).toBe(quantity);
      expect(stock.reserved).toBe(reserved);
      expect(stock.updatedAt).toBe(updatedAt);
      expect(stock.getAvailableQuantity()).toBe(40);
      expect(stock.isAvailable()).toBeTruthy();
      expect(stock.isOutOfStock()).toBeFalsy();
    });

    it('should create with default reserved and updatedAt', () => {
      const stock = new StockEntity('product-1', 20);

      expect(stock.reserved).toBe(0);
      expect(stock.updatedAt).toBeInstanceOf(Date);
      expect(stock.getAvailableQuantity()).toBe(20);
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

    it('should validate reserved', () => {
      const validReserved = [0, 5, 10];

      validReserved.forEach((reserved) => {
        expect(() => {
          new StockEntity('product-1', 20, reserved);
        }).not.toThrow();
      });
    });

    it('should reject invalid reserved', () => {
      const invalidReserved = [-1, -5, 3.5];

      invalidReserved.forEach((reserved) => {
        expect(() => {
          new StockEntity('product-1', 20, reserved);
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

  describe('availability calculations', () => {
    it('should calculate available quantity correctly', () => {
      const stock = new StockEntity('product-1', 20, 5);
      expect(stock.getAvailableQuantity()).toBe(15);
    });

    it('should determine availability correctly', () => {
      const availableStock = new StockEntity('product-1', 20, 5);
      const outOfStock = new StockEntity('product-1', 10, 10);

      expect(availableStock.isAvailable()).toBeTruthy();
      expect(availableStock.isOutOfStock()).toBeFalsy();

      expect(outOfStock.isAvailable()).toBeFalsy();
      expect(outOfStock.isOutOfStock()).toBeTruthy();
    });

    it('should check if can reserve correctly', () => {
      const stock = new StockEntity('product-1', 20, 5);

      expect(stock.canReserve(10)).toBeTruthy();
      expect(stock.canReserve(15)).toBeTruthy();
      expect(stock.canReserve(16)).toBeFalsy();
    });
  });

  describe('stock operations', () => {
    it('should reserve stock correctly', () => {
      const stock = new StockEntity('product-1', 20, 5);
      const reservedStock = stock.reserve(3);

      expect(reservedStock.quantity).toBe(20);
      expect(reservedStock.reserved).toBe(8);
      expect(reservedStock.getAvailableQuantity()).toBe(12);
      expect(reservedStock.updatedAt).not.toBe(stock.updatedAt);
    });

    it('should throw error when reserving more than available', () => {
      const stock = new StockEntity('product-1', 20, 15);

      expect(() => {
        stock.reserve(6);
      }).toThrow('Cannot reserve 6 units. Only 5 available');
    });

    it('should release reservation correctly', () => {
      const stock = new StockEntity('product-1', 20, 8);
      const releasedStock = stock.releaseReservation(3);

      expect(releasedStock.quantity).toBe(20);
      expect(releasedStock.reserved).toBe(5);
      expect(releasedStock.getAvailableQuantity()).toBe(15);
    });

    it('should throw error when releasing more than reserved', () => {
      const stock = new StockEntity('product-1', 20, 5);

      expect(() => {
        stock.releaseReservation(6);
      }).toThrow('Cannot release 6 units. Only 5 reserved');
    });

    it('should confirm reservation correctly', () => {
      const stock = new StockEntity('product-1', 20, 8);
      const confirmedStock = stock.confirmReservation(5);

      expect(confirmedStock.quantity).toBe(15);
      expect(confirmedStock.reserved).toBe(3);
      expect(confirmedStock.getAvailableQuantity()).toBe(12);
    });

    it('should throw error when confirming more than reserved', () => {
      const stock = new StockEntity('product-1', 20, 5);

      expect(() => {
        stock.confirmReservation(6);
      }).toThrow('Cannot confirm 6 units. Only 5 reserved');
    });
  });
});
