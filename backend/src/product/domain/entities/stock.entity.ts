export class StockEntity {
  constructor(
    public readonly productId: string,
    public readonly quantity: number,
    public readonly reserved: number = 0,
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validateProductId(productId);
    this.validateQuantity(quantity);

    if (reserved) {
      this.validateQuantity(reserved);
    }
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

  getAvailableQuantity(): number {
    return this.quantity - this.reserved;
  }

  isAvailable(): boolean {
    return this.getAvailableQuantity() > 0;
  }

  isOutOfStock(): boolean {
    return this.getAvailableQuantity() === 0;
  }

  canReserve(amount: number): boolean {
    return this.getAvailableQuantity() >= amount;
  }

  reserve(amount: number): StockEntity {
    if (!this.canReserve(amount)) {
      throw new Error(
        `Cannot reserve ${amount} units. Only ${this.getAvailableQuantity()} available`,
      );
    }

    return new StockEntity(
      this.productId,
      this.quantity,
      this.reserved + amount,
      new Date(),
    );
  }

  releaseReservation(amount: number): StockEntity {
    if (amount > this.reserved) {
      throw new Error(
        `Cannot release ${amount} units. Only ${this.reserved} reserved`,
      );
    }

    return new StockEntity(
      this.productId,
      this.quantity,
      this.reserved - amount,
      new Date(),
    );
  }

  confirmReservation(amount: number): StockEntity {
    if (amount > this.reserved) {
      throw new Error(
        `Cannot confirm ${amount} units. Only ${this.reserved} reserved`,
      );
    }

    return new StockEntity(
      this.productId,
      this.quantity - amount,
      this.reserved - amount,
      new Date(),
    );
  }
}
