/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-return */

export abstract class Result<T, E> {
  abstract isSuccess(): this is Success<T>;
  abstract isFailure(): this is Failure<E>;

  abstract bind<U, F>(func: (value: T) => Result<U, F>): Result<U, E | F>;
  abstract bindAsync<U, F>(
    func: (value: T) => Promise<Result<U, F>>,
  ): Promise<Result<U, E | F>>;
  abstract map<U>(func: (value: T) => U): Result<U, E>;

  abstract get value(): T;
  abstract get error(): E;
}

export class Success<T> extends Result<T, never> {
  constructor(private readonly _value: T) {
    super();
  }

  isSuccess(): this is Success<T> {
    return true;
  }

  isFailure(): this is Failure<never> {
    return false;
  }

  bind<U, F>(func: (value: T) => Result<U, F>): Result<U, F> {
    return func(this.value);
  }

  async bindAsync<U, F>(
    func: (value: T) => Promise<Result<U, F>>,
  ): Promise<Result<U, F>> {
    return func(this._value);
  }

  map<U>(func: (value: T) => U): Result<U, never> {
    return new Success(func(this.value));
  }

  get value(): T {
    return this._value;
  }

  get error(): never {
    throw new Error('Cannot access error on Success');
  }
}

export class Failure<E> extends Result<never, E> {
  constructor(private readonly _error: E) {
    super();
  }

  isSuccess(): this is Success<never> {
    return false;
  }

  isFailure(): this is Failure<E> {
    return true;
  }

  bind<U, F>(_func: (value: never) => Result<U, F>): Result<U, E> {
    return this as any;
  }

  bindAsync<U, F>(
    _func: (value: never) => Promise<Result<U, F>>,
  ): Promise<Result<U, E>> {
    return this as any;
  }

  map<U>(_func: (value: never) => U): Result<U, E> {
    return this as any;
  }

  get value(): never {
    throw new Error('Cannot access value on Failure');
  }

  get error(): E {
    return this._error;
  }
}

export function success<T>(value: T): Success<T> {
  return new Success(value);
}

export function failure<E>(error: E): Failure<E> {
  return new Failure(error);
}
