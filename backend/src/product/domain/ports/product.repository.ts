import { ProductEntity } from '../entities/product.entity';

export interface ProductRepository {
  findById(id: string): Promise<ProductEntity | null>;
  updateStock(product: ProductEntity): Promise<ProductEntity>;
}
