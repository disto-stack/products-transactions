export abstract class CheckCustomerError extends Error {
  abstract readonly type: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class BusinessRuleError extends CheckCustomerError {
  readonly type = 'BUSINESS_RULE_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class RepositoryError extends CheckCustomerError {
  readonly type = 'REPOSITORY_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class UnexpectedError extends CheckCustomerError {
  readonly type = 'UNEXPECTED_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export type CheckCustomerErrorType =
  | BusinessRuleError
  | RepositoryError
  | UnexpectedError;
