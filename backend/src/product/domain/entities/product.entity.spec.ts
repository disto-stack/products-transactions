import { ProductEntity } from './product.entity';
import { StockEntity } from './stock.entity';

describe('ProductEntity', () => {
  describe('constructor', () => {
    it('should create product entity with all properties', () => {
      const id = '123';
      const name = 'Nike';
      const description = 'shoes';
      const price = 1000000;
      const image = 'https://example.com/image.jpg';

      const stock = new StockEntity(
        id,
        10,
        new Date('2024-01-01T10:00:00.000Z'),
      );

      const product = new ProductEntity(
        id,
        name,
        description,
        price,
        image,
        stock,
      );

      expect(product.id).toBe(id);
      expect(product.name).toBe(name);
      expect(product.description).toBe(description);
      expect(product.image).toBe(image);
      expect(product.price).toBe(1000000);
      expect(product.isAvailable()).toBeTruthy();
      expect(product.isOutOfStock()).toBeFalsy();
      expect(product.getStockQuantity()).toBe(10);
      expect(product.getFormattedPrice()).toContain('1.000.000,00');
      expect(product.hasImage()).toBeTruthy();

      expect(product.getStockInfo()).toEqual({
        quantity: 10,
        available: true,
        lastUpdated: new Date('2024-01-01T10:00:00.000Z'),
      });
    });
  });

  describe('business rules', () => {
    const stock = new StockEntity('product-id', 10);

    it('should validate prices', () => {
      const validPrices = [3222, 67788, 5566666, 4444];

      validPrices.forEach((price) => {
        expect(() => {
          new ProductEntity('1', 'Nike', 'Shoes', price, null, stock);
        }).not.toThrow();
      });
    });

    it('should reject negative prices', () => {
      const invalidPrices = [-3222, -67788, -5566666, -4444];

      invalidPrices.forEach((price) => {
        expect(() => {
          new ProductEntity('1', 'Nike', 'Shoes', price, null, stock);
        }).toThrow();
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = ['', ' '];

      invalidNames.forEach((name) => {
        expect(() => {
          new ProductEntity('1', name, 'Shoes', 10000, null, stock);
        }).toThrow();
      });
    });

    it('should reject invalid names', () => {
      const invalidDescriptions = ['', ' '];

      invalidDescriptions.forEach((description) => {
        expect(() => {
          new ProductEntity('1', 'Nike', description, 10000, null, stock);
        }).toThrow();
      });
    });
  });
});
