import { IsEmail, IsNotEmpty } from 'class-validator';

export class CheckCustomertExistsDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
