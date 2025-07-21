export class RepositoryError extends Error {
  readonly type = 'REPOSITORY_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'RepositoryError';
  }
}

export class NotFoundError extends Error {
  readonly type = 'NOT_FOUND_ERROR';

  constructor(resource: string, identifier: string) {
    super(`${resource} with identifier ${identifier} not found`);
    this.name = 'NotFoundError';
  }
}

export class BusinessRuleError extends Error {
  readonly type = 'BUSINESS_RULE_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'BusinessRuleError';
  }
}

export class UnexpectedError extends Error {
  readonly type = 'UNEXPECTED_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'UnexpectedError';
  }
}
