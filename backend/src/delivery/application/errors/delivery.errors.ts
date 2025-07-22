import { NotFoundError } from '../../../shared/application/errors/application.errors';

export class DeliveryTransactionNotFoundError extends NotFoundError {
  constructor(transactionId: string) {
    super(`Transaction`, transactionId);
    this.name = 'DeliveryTransactionNotFoundError';
  }
}

export class DeliveryTransactionNotApprovedError extends Error {
  constructor(transactionId: string) {
    super(`Transaction ${transactionId} is not approved`);
    this.name = 'DeliveryTransactionNotApprovedError';
  }
}

export class DeliveryAlreadyExistsError extends Error {
  constructor(transactionId: string) {
    super(`Delivery already exists for transaction ${transactionId}`);
    this.name = 'DeliveryAlreadyExistsError';
  }
}
