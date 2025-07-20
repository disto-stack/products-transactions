export class StockEntity {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validateProductId(productId);
    this.validateQuantity(quantity);
  }

  private validateProductId(productId: string): void {
    if (!productId || productId.trim() === '') {
      throw new Error('Product ID cannot be empty');
    }
  }

  private validateQuantity(quantity: number): void {
    if (quantity < 0) {
      throw new Error('Stock quantity cannot be negative');
    }

    if (!Number.isInteger(quantity)) {
      throw new Error('Stock quantity must be an integer');
    }
  }

  isAvailable(): boolean {
    return this.quantity > 0;
  }

  isOutOfStock(): boolean {
    return this.quantity === 0;
  }
}
