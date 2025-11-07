import { ResultDto } from "./result.dto";

export class PaginatedResultDto<T> extends ResultDto<T[]> {
  constructor(
    isSuccess: boolean,
    message: string,
    data: T[],
    public totalCount: number,
    public totalPages: number,
  ) {
    super(isSuccess, message, data);
  }

  static createSuccessPaginatedResult<T>(
    data: T[],
    totalCount: number,
    totalPages: number,
  ): PaginatedResultDto<T> {
    return new PaginatedResultDto<T>(true, 'Success', data, totalCount, totalPages);
  }
}
