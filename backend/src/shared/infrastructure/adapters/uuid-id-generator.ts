import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { IdGenerator } from '../../domain/ports/id-generator';

@Injectable()
export class UuidIdGenerator implements IdGenerator {
  generateId(): string {
    return uuidv4();
  }
}
