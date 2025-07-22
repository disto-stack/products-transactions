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

export class TransactionAlreadyProcessedError extends Error {
  readonly type = 'ALREADY_PROCESSED_ERROR';

  constructor(transactionId: string, currentStatus: string) {
    super(
      `Transaction ${transactionId} is already processed with status: ${currentStatus}`,
    );
    this.name = 'TransactionAlreadyProcessedError';
  }
}

export class DeliveryAlreadyExistsError extends Error {
  constructor(transactionId: string) {
    super(`Delivery already exists for transaction ${transactionId}`);
    this.name = 'DeliveryAlreadyExistsError';
  }
}
