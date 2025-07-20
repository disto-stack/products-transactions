import { NotFoundError } from '../../../shared/errors/application.errors';

export class ProductNotFoundError extends NotFoundError {
  constructor(productId: string) {
    super(`Product`, productId);
    this.name = 'ProductNotFoundError';
  }
}
