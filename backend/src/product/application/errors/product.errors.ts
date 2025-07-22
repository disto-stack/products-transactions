import { NotFoundError } from '../../../shared/application/errors/application.errors';

export class ProductNotFoundError extends NotFoundError {
  constructor(productId: string) {
    super(`Product`, productId);
    this.name = 'ProductNotFoundError';
  }
}
