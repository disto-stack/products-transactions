import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CreateDeliveryDto {
  @IsString()
  @IsNotEmpty()
  transactionId: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  city: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  department: string;
}
