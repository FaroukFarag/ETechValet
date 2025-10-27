export class PaginatedModel {
  public pageSize: number;
  public pageNumber: number;

  constructor(pageSize?: number, pageNumber?: number) {
    this.pageSize = pageSize || 10;
    this.pageNumber = pageNumber || 1;
  }
}