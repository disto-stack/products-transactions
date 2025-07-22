import { IsString, IsNotEmpty } from 'class-validator';

export class ChangeTransactionDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
