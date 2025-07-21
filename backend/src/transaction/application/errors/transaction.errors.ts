import { NotFoundError } from '../../../shared/application/errors/application.errors';

export class TransactionProductNotFoundError extends NotFoundError {
  constructor(productId: string) {
    super(`Product`, productId);
    this.name = 'TransactionProductNotFoundError';
  }
}

export class TransactionNotFoundError extends NotFoundError {
  constructor(transactionId: string) {
    super(`Transaction`, transactionId);
    this.name = 'TransactionNotFoundError';
  }
}

export class TransactionInsufficientStockError extends Error {
  readonly type = 'INSUFFICIENT_STOCK_ERROR';

  constructor(
    productId: string,
    requestedQuantity: number,
    availableStock: number,
  ) {
    super(
      `Product ${productId} has insufficient stock: requested ${requestedQuantity}, available ${availableStock}`,
    );
    this.name = 'TransactionInsufficientStockError';
  }
}
