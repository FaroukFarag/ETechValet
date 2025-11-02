export class BaseSpecification {
  criteria?: string;
  includes: string[] = [];
  orderBy?: string;
  orderByDescending?: string;

  addCriteria(criteria: string) {
    this.criteria = criteria;
  }

  addInclude(include: string) {
    this.includes.push(include);
  }

  addOrderBy(column: string) {
    this.orderBy = column;
  }

  addOrderByDescending(column: string) {
    this.orderByDescending = column;
  }
}
