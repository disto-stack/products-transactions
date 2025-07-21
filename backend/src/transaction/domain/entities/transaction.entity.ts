import { PaymentMethod } from '../enums/payment-method.enum';
import { TransactionStatus } from '../enums/transaction-status.enum';

export class TransactionEntity {
  constructor(
    public readonly id: string,
    public readonly status: TransactionStatus,
    public readonly productId: string,
    public readonly productQuantity: number,
    public readonly totalAmount: number,
    public readonly customerId: string,
    public readonly paymentMethod: PaymentMethod,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validateProductId(productId);
    this.validateCustomerId(customerId);
    this.validateQuantity(productQuantity);
    this.validateTotalAmount(totalAmount);
  }

  private validateProductId(productId: string): void {
    if (!productId || productId.trim() === '') {
      throw new Error('Product ID cannot be empty');
    }
  }

  private validateCustomerId(customerId: string): void {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID cannot be empty');
    }
  }

  private validateQuantity(quantity: number): void {
    if (quantity <= 0) {
      throw new Error('Product quantity must be greater than zero');
    }

    if (!Number.isInteger(quantity)) {
      throw new Error('Product quantity must be an integer');
    }
  }

  private validateDeliveryPrice(deliveryPrice: number): void {
    if (deliveryPrice < 0) {
      throw new Error('Delivery price cannot be negative');
    }
  }

  private validateTotalAmount(totalAmount: number): void {
    if (totalAmount <= 0) {
      throw new Error('Total amount must be greater than zero');
    }
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isApproved(): boolean {
    return this.status === TransactionStatus.APPROVED;
  }

  isDeclined(): boolean {
    return this.status === TransactionStatus.DECLINED;
  }

  canBeApproved(): boolean {
    return this.isPending();
  }

  canBeDeclined(): boolean {
    return this.isPending();
  }

  approve(): TransactionEntity {
    if (!this.canBeApproved()) {
      throw new Error('Transaction can only be approved when pending');
    }

    return new TransactionEntity(
      this.id,
      TransactionStatus.APPROVED,
      this.productId,
      this.productQuantity,
      this.totalAmount,
      this.customerId,
      this.paymentMethod,
      this.createdAt,
      new Date(),
    );
  }

  decline(): TransactionEntity {
    if (!this.canBeDeclined()) {
      throw new Error('Transaction can only be declined when pending');
    }

    return new TransactionEntity(
      this.id,
      TransactionStatus.DECLINED,
      this.productId,
      this.productQuantity,
      this.totalAmount,
      this.customerId,
      this.paymentMethod,
      this.createdAt,
      new Date(),
    );
  }

  getFormattedTotalAmount(): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(this.totalAmount);
  }

  static create(
    id: string,
    productId: string,
    productQuantity: number,
    totalAmount: number,
    customerId: string,
    paymentMethod: PaymentMethod,
    status?: TransactionStatus,
  ): TransactionEntity {
    return new TransactionEntity(
      id,
      status || TransactionStatus.PENDING,
      productId,
      productQuantity,
      totalAmount,
      customerId,
      paymentMethod,
    );
  }
}
