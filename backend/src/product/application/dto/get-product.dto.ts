import { IsNotEmpty } from 'class-validator';

export class GetProductDto {
  @IsNotEmpty()
  id: string;
}
