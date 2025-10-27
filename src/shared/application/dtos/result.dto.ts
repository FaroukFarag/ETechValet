export class ResultDto<T> {
  constructor(
    public isSuccess: boolean,
    public message: string,
    public data?: T,
  ) {}

  static createSuccessResult<T>(data: T): ResultDto<T> {
    return new ResultDto<T>(true, 'Success', data);
  }

  static createFailResult<T>(message: string): ResultDto<T> {
    return new ResultDto<T>(false, message);
  }
}
