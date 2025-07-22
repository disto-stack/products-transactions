import { DeliveryEntity } from '../entitites/delivery.entity';

export interface DeliveryRepository {
  save(delivery: DeliveryEntity): Promise<DeliveryEntity>;
}
