import { StockEntity } from './stock.entity';

export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly image: string | null,
    private readonly stock: StockEntity,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateName(name);
    this.validateDescription(description);
    this.validatePrice(price);
  }

  private validateName(name: string): void {
    if (!name || name.trim() === '') {
      throw new Error('Product name cannot be empty');
    }
  }

  private validateDescription(description: string): void {
    if (!description || description.trim() === '') {
      throw new Error('Product description cannot be empty');
    }
  }

  private validatePrice(price: number): void {
    if (price <= 0) {
      throw new Error('Product price must be greater than zero');
    }
  }

  getStockQuantity(): number {
    return this.stock.quantity;
  }

  isAvailable(): boolean {
    return this.stock.isAvailable();
  }

  isOutOfStock(): boolean {
    return this.stock.isOutOfStock();
  }

  getStockInfo(): {
    quantity: number;
    available: boolean;
    lastUpdated: Date;
  } {
    return {
      quantity: this.stock.quantity,
      available: this.stock.isAvailable(),
      lastUpdated: this.stock.updatedAt,
    };
  }

  getFormattedPrice(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(this.price);
  }

  hasImage(): boolean {
    return this.image !== null && this.image.trim() !== '';
  }

  static createWithStock(
    id: string,
    name: string,
    description: string,
    price: number,
    image: string | null,
    initialStock: number,
  ): ProductEntity {
    const stock = new StockEntity(id, initialStock);
    return new ProductEntity(id, name, description, price, image, stock);
  }
}
