import { StockEntity } from './stock.entity';

export class ProductEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly price: number,
    public readonly deliveryPrice: number,
    public readonly taxPercentage: number,
    public readonly image: string | null,
    private readonly stock: StockEntity,
    public readonly createdAt: Date = new Date(),
  ) {
    this.validateName(name);
    this.validateDescription(description);
    this.validatePrice(price);
    this.validateDeliveryPrice(deliveryPrice);
    this.validateTaxPercentage(taxPercentage);
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

  private validateDeliveryPrice(deliveryPrice: number): void {
    if (deliveryPrice < 0) {
      throw new Error('Delivery price cannot be negative');
    }
  }

  private validateTaxPercentage(taxPercentage: number): void {
    if (taxPercentage < 0 || taxPercentage > 100) {
      throw new Error('Tax percentage must be between 0 and 100');
    }
  }

  getSubtotal(quantity: number): number {
    return this.price * quantity;
  }

  getTaxAmount(quantity: number): number {
    const subtotal = this.getSubtotal(quantity);
    return Math.round(subtotal * (this.taxPercentage / 100));
  }

  getFormattedTaxAmount(quantity: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(this.getTaxAmount(quantity));
  }

  getTotalAmount(quantity: number): number {
    const subtotal = this.getSubtotal(quantity);
    const tax = this.getTaxAmount(quantity);
    return subtotal + tax + this.deliveryPrice;
  }

  getFormattedTotalAmount(quantity: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(this.getTotalAmount(quantity));
  }

  getFormattedDeliveryPrice(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(this.deliveryPrice);
  }

  getAvailableStock(): number {
    return this.stock.getAvailableQuantity();
  }

  getStockQuantity(): number {
    return this.stock.quantity;
  }

  getReservedQuantity(): number {
    return this.stock.reserved;
  }

  isAvailable(): boolean {
    return this.stock.isAvailable();
  }

  isOutOfStock(): boolean {
    return this.stock.isOutOfStock();
  }

  hasImage(): boolean {
    return this.image !== null && this.image.trim() !== '';
  }

  getFormattedPrice(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(this.price);
  }

  canReserve(amount: number): boolean {
    return this.stock.canReserve(amount);
  }

  reserve(amount: number): ProductEntity {
    const updatedStock = this.stock.reserve(amount);

    return new ProductEntity(
      this.id,
      this.name,
      this.description,
      this.price,
      this.deliveryPrice,
      this.taxPercentage,
      this.image,
      updatedStock,
      this.createdAt,
    );
  }

  releaseReservation(amount: number): ProductEntity {
    const updatedStock = this.stock.releaseReservation(amount);

    return new ProductEntity(
      this.id,
      this.name,
      this.description,
      this.price,
      this.deliveryPrice,
      this.taxPercentage,
      this.image,
      updatedStock,
      this.createdAt,
    );
  }

  confirmReservation(amount: number): ProductEntity {
    const updatedStock = this.stock.confirmReservation(amount);

    return new ProductEntity(
      this.id,
      this.name,
      this.description,
      this.price,
      this.deliveryPrice,
      this.taxPercentage,
      this.image,
      updatedStock,
      this.createdAt,
    );
  }

  getStockInfo(): {
    quantity: number;
    available: boolean;
    reserved: number;
    lastUpdated: Date;
  } {
    return {
      quantity: this.stock.quantity,
      reserved: this.stock.reserved,
      available: this.stock.isAvailable(),
      lastUpdated: this.stock.updatedAt,
    };
  }

  static createWithStock(
    id: string,
    name: string,
    description: string,
    price: number,
    deliveryPrice: number,
    taxPercentage: number,
    image: string | null,
    initialStock: number,
    reservedStock?: number,
  ): ProductEntity {
    const stock = new StockEntity(id, initialStock, reservedStock);
    return new ProductEntity(
      id,
      name,
      description,
      price,
      deliveryPrice,
      taxPercentage,
      image,
      stock,
    );
  }
}
