import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { DeliveryRepository } from 'src/delivery/domain/ports/delivery.repository';
import { DeliveryEntity } from '../../domain/entitites/delivery.entity';

@Injectable()
export class PrismaDeliveryRepositoryImpl implements DeliveryRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async save(delivery: DeliveryEntity): Promise<DeliveryEntity> {
    const savedDelivery = await this.prismaService.delivery.create({
      data: delivery,
    });

    return new DeliveryEntity(
      savedDelivery.transactionId,
      savedDelivery.address,
      savedDelivery.city,
      savedDelivery.department,
      savedDelivery.createdAt,
      savedDelivery.updatedAt,
    );
  }
}
