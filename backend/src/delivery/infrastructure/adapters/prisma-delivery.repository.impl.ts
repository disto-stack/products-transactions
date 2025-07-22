import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/prisma/prisma.service';
import { DeliveryRepository } from 'src/delivery/domain/ports/delivery.repository';
import { DeliveryEntity } from '../../domain/entities/delivery.entity';

@Injectable()
export class PrismaDeliveryRepositoryImpl implements DeliveryRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByTransactionId(
    transactionId: string,
  ): Promise<DeliveryEntity | null> {
    const delivery = await this.prismaService.delivery.findUnique({
      where: { transactionId },
    });

    if (!delivery) {
      return null;
    }

    return DeliveryEntity.create(
      delivery.transactionId,
      delivery.address,
      delivery.city,
      delivery.department,
      delivery.createdAt,
      delivery.updatedAt,
    );
  }

  async save(delivery: DeliveryEntity): Promise<DeliveryEntity> {
    const savedDelivery = await this.prismaService.delivery.create({
      data: {
        transactionId: delivery.transactionId,
        address: delivery.address,
        city: delivery.city,
        department: delivery.department,
        createdAt: delivery.createdAt,
        updatedAt: delivery.updatedAt,
      },
    });

    return DeliveryEntity.create(
      savedDelivery.transactionId,
      savedDelivery.address,
      savedDelivery.city,
      savedDelivery.department,
      savedDelivery.createdAt,
      savedDelivery.updatedAt,
    );
  }
}
