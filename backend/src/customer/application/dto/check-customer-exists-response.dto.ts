import { CustomerDto } from './customer-response.dto';

export interface CheckCustomerExistsResponseDto {
  exists: boolean;
  customer: CustomerDto | null;
}
