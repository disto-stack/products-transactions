import { DeliveryEntity } from '../entities/delivery.entity';

export interface DeliveryRepository {
  save(delivery: DeliveryEntity): Promise<DeliveryEntity>;
  findByTransactionId(transactionId: string): Promise<DeliveryEntity | null>;
}
