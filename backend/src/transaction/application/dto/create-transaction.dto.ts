import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { PaymentMethod } from '../../domain/enums/payment-method.enum';

export class CreateTransactionDto {
  @IsNotEmpty()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  productQuantity: number;

  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsNotEmpty()
  @IsEmail()
  customerEmail: string;

  @IsNotEmpty()
  customerName: string;

  @IsNotEmpty()
  customerPhone: string;
}
export { PaymentMethod };
