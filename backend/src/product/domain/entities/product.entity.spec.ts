import { ProductEntity } from './product.entity';
import { StockEntity } from './stock.entity';

describe('ProductEntity', () => {
  describe('constructor', () => {
    it('should create product entity with all properties', () => {
      const id = '123';
      const name = 'Nike';
      const description = 'shoes';
      const price = 1000000;
      const deliveryPrice = 25000;
      const taxPercentage = 19;
      const image = 'https://example.com/image.jpg';

      const stock = new StockEntity(
        id,
        10,
        0,
        new Date('2024-01-01T10:00:00.000Z'),
      );

      const product = new ProductEntity(
        id,
        name,
        description,
        price,
        deliveryPrice,
        taxPercentage,
        image,
        stock,
      );

      expect(product.id).toBe(id);
      expect(product.name).toBe(name);
      expect(product.description).toBe(description);
      expect(product.image).toBe(image);
      expect(product.price).toBe(1000000);
      expect(product.deliveryPrice).toBe(deliveryPrice);
      expect(product.taxPercentage).toBe(taxPercentage);
      expect(product.isAvailable()).toBeTruthy();
      expect(product.isOutOfStock()).toBeFalsy();
      expect(product.getStockQuantity()).toBe(10);
      expect(product.getAvailableStock()).toBe(10);
      expect(product.getReservedQuantity()).toBe(0);
      expect(product.getFormattedPrice()).toContain('1.000.000,00');
      expect(product.getFormattedDeliveryPrice()).toContain('25.000');
      expect(product.hasImage()).toBeTruthy();
      expect(product.canReserve(3)).toBeTruthy();

      expect(product.getStockInfo()).toEqual({
        quantity: 10,
        reserved: 0,
        available: true,
        lastUpdated: new Date('2024-01-01T10:00:00.000Z'),
      });
    });

    it('should create product without image', () => {
      const stock = new StockEntity('product-id', 5, 0);

      const product = new ProductEntity(
        'product-id',
        'Basic Product',
        'Simple description',
        500000,
        15000,
        19,
        null,
        stock,
      );

      expect(product.hasImage()).toBeFalsy();
      expect(product.image).toBeNull();
    });
  });

  describe('business rules', () => {
    const stock = new StockEntity('product-id', 10);

    it('should validate prices', () => {
      const validPrices = [3222, 67788, 5566666, 4444];

      validPrices.forEach((price) => {
        expect(() => {
          new ProductEntity('1', 'Nike', 'Shoes', price, 0, 19, null, stock);
        }).not.toThrow();
      });
    });

    it('should reject negative prices', () => {
      const invalidPrices = [-3222, -67788, -5566666, -4444];

      invalidPrices.forEach((price) => {
        expect(() => {
          new ProductEntity('1', 'Nike', 'Shoes', price, 0, 19, null, stock);
        }).toThrow();
      });
    });

    it('should validate delivery prices', () => {
      const validDeliveryPrices = [0, 15000, 25000, 50000];

      validDeliveryPrices.forEach((deliveryPrice) => {
        expect(() => {
          new ProductEntity(
            '1',
            'Nike',
            'Shoes',
            100000,
            deliveryPrice,
            19,
            null,
            stock,
          );
        }).not.toThrow();
      });
    });

    it('should reject invalid delivery prices', () => {
      const invalidDeliveryPrices = [-1000, -25000];

      invalidDeliveryPrices.forEach((deliveryPrice) => {
        expect(() => {
          new ProductEntity(
            '1',
            'Nike',
            'Shoes',
            100000,
            deliveryPrice,
            19,
            null,
            stock,
          );
        }).toThrow('Delivery price cannot be negative');
      });
    });

    it('should validate tax percentages', () => {
      const validTaxPercentages = [0, 5, 19, 21, 100];

      validTaxPercentages.forEach((taxPercentage) => {
        expect(() => {
          new ProductEntity(
            '1',
            'Nike',
            'Shoes',
            100000,
            25000,
            taxPercentage,
            null,
            stock,
          );
        }).not.toThrow();
      });
    });

    it('should reject invalid tax percentages', () => {
      const invalidTaxPercentages = [-5, -19, 101, 150];

      invalidTaxPercentages.forEach((taxPercentage) => {
        expect(() => {
          new ProductEntity(
            '1',
            'Nike',
            'Shoes',
            100000,
            25000,
            taxPercentage,
            null,
            stock,
          );
        }).toThrow('Tax percentage must be between 0 and 100');
      });
    });

    it('should reject invalid names', () => {
      const invalidNames = ['', ' '];

      invalidNames.forEach((name) => {
        expect(() => {
          new ProductEntity('1', name, 'Shoes', 10000, 0, 19, null, stock);
        }).toThrow();
      });
    });

    it('should reject invalid descriptions', () => {
      const invalidDescriptions = ['', ' '];

      invalidDescriptions.forEach((description) => {
        expect(() => {
          new ProductEntity(
            '1',
            'Nike',
            description,
            10000,
            0,
            19,
            null,
            stock,
          );
        }).toThrow();
      });
    });
  });

  describe('pricing calculations', () => {
    it('should calculate subtotal correctly', () => {
      const stock = new StockEntity('product-id', 10, 0);
      const product = new ProductEntity(
        'product-id',
        'Laptop',
        'Gaming laptop',
        1500000,
        25000,
        19,
        null,
        stock,
      );

      expect(product.getSubtotal(1)).toBe(1500000);
      expect(product.getSubtotal(2)).toBe(3000000);
      expect(product.getSubtotal(3)).toBe(4500000);
    });

    it('should calculate tax amount correctly', () => {
      const stock = new StockEntity('product-id', 10, 0);
      const product = new ProductEntity(
        'product-id',
        'Laptop',
        'Gaming laptop',
        1000000,
        25000,
        19,
        null,
        stock,
      );

      expect(product.getTaxAmount(1)).toBe(190000);
      expect(product.getTaxAmount(2)).toBe(380000);
    });

    it('should calculate total amount correctly', () => {
      const stock = new StockEntity('product-id', 10, 0);
      const product = new ProductEntity(
        'product-id',
        'Laptop',
        'Gaming laptop',
        1000000,
        25000,
        19,
        null,
        stock,
      );

      expect(product.getTotalAmount(1)).toBe(1215000);

      expect(product.getTotalAmount(2)).toBe(2405000);
    });

    it('should format prices correctly', () => {
      const stock = new StockEntity('product-id', 10, 0);
      const product = new ProductEntity(
        'product-id',
        'Laptop',
        'Gaming laptop',
        1500000,
        25000,
        19,
        null,
        stock,
      );

      expect(product.getFormattedPrice()).toMatch(/1\.500\.000/);
      expect(product.getFormattedDeliveryPrice()).toMatch(/25\.000/);
      expect(product.getFormattedTaxAmount(1)).toMatch(/285\.000/);
      expect(product.getFormattedTotalAmount(1)).toMatch(/1\.810\.000/);
    });
  });

  describe('stock operations', () => {
    it('should check if product can reserve stock', () => {
      const stock = new StockEntity('product-id', 10, 2);
      const product = new ProductEntity(
        'product-id',
        'Product',
        'Description',
        100000,
        15000,
        19,
        null,
        stock,
      );

      expect(product.canReserve(5)).toBeTruthy();
      expect(product.canReserve(8)).toBeTruthy();
      expect(product.canReserve(9)).toBeFalsy();
    });

    it('should reserve stock correctly', () => {
      const stock = new StockEntity('product-id', 10, 0);
      const product = new ProductEntity(
        'product-id',
        'Product',
        'Description',
        100000,
        15000,
        19,
        null,
        stock,
      );

      const reservedProduct = product.reserve(3);

      expect(reservedProduct.getStockQuantity()).toBe(10);
      expect(reservedProduct.getReservedQuantity()).toBe(3);
      expect(reservedProduct.getAvailableStock()).toBe(7);
    });

    it('should release reservation correctly', () => {
      const stock = new StockEntity('product-id', 10, 5); // 5 reserved
      const product = new ProductEntity(
        'product-id',
        'Product',
        'Description',
        100000,
        15000,
        19,
        null,
        stock,
      );

      const releasedProduct = product.releaseReservation(2);

      expect(releasedProduct.getStockQuantity()).toBe(10);
      expect(releasedProduct.getReservedQuantity()).toBe(3);
      expect(releasedProduct.getAvailableStock()).toBe(7);
    });

    it('should confirm reservation correctly', () => {
      const stock = new StockEntity('product-id', 10, 5);
      const product = new ProductEntity(
        'product-id',
        'Product',
        'Description',
        100000,
        15000,
        19,
        null,
        stock,
      );

      const confirmedProduct = product.confirmReservation(3);

      expect(confirmedProduct.getStockQuantity()).toBe(7);
      expect(confirmedProduct.getReservedQuantity()).toBe(2);
      expect(confirmedProduct.getAvailableStock()).toBe(5);
    });

    it('should throw error when trying to reserve more than available', () => {
      const stock = new StockEntity('product-id', 10, 5);
      const product = new ProductEntity(
        'product-id',
        'Product',
        'Description',
        100000,
        15000,
        19,
        null,
        stock,
      );

      expect(() => {
        product.reserve(6);
      }).toThrow('Cannot reserve 6 units. Only 5 available');
    });
  });

  describe('factory method', () => {
    it('should create product with stock using factory method', () => {
      const product = ProductEntity.createWithStock(
        'product-id',
        'Gaming Mouse',
        'RGB gaming mouse',
        150000,
        20000,
        19,
        'https://example.com/mouse.jpg',
        25,
        5,
      );

      expect(product.id).toBe('product-id');
      expect(product.name).toBe('Gaming Mouse');
      expect(product.price).toBe(150000);
      expect(product.deliveryPrice).toBe(20000);
      expect(product.taxPercentage).toBe(19);
      expect(product.getStockQuantity()).toBe(25);
      expect(product.getReservedQuantity()).toBe(5);
      expect(product.getAvailableStock()).toBe(20);
    });

    it('should create product with default reserved stock', () => {
      const product = ProductEntity.createWithStock(
        'product-id',
        'Keyboard',
        'Mechanical keyboard',
        200000,
        15000,
        19,
        null,
        10,
      );

      expect(product.getReservedQuantity()).toBe(0);
      expect(product.getAvailableStock()).toBe(10);
    });
  });
});
