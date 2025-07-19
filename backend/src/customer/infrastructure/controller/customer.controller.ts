import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { CheckCustomerExistsUseCase } from '../../application/use-cases/check-customer-exists.use-case';
import { CheckCustomertExistsDto } from '../../application/dto/check-customer-exists.dto';

@Controller('customers')
export class CustomerController {
  constructor(
    private readonly checkCustomerExistsUseCase: CheckCustomerExistsUseCase,
  ) {}

  @Get('check')
  async checkExists(@Query(ValidationPipe) checkDto: CheckCustomertExistsDto) {
    try {
      const customer = await this.checkCustomerExistsUseCase.execute(checkDto);

      return {
        success: true,
        data: {
          exists: customer !== null,
          customer: customer || null,
        },
        message: customer ? 'Customer found' : 'Customer not found',
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Internal server error';

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }
}
