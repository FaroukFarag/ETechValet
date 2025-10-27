import { getFilterProperty } from "src/shared/domain/decorators/filter-property.decorator";

export class QueryableFilterUtil {
  static applyFilters<TEntity, TFilterDto>(
    queryBuilder: any,
    alias: string,
    filterDto: TFilterDto,
  ) {
    if (!filterDto) throw new Error('filterDto cannot be null.');

    const filterEntries = Object.entries(filterDto).filter(
      ([, value]) => value !== null && value !== undefined && value !== '',
    );

    for (const [propertyKey, value] of filterEntries) {
      const entityProperty =
        getFilterProperty(filterDto, propertyKey) ?? propertyKey;

      if (propertyKey.startsWith('From')) {
        const normalizedName = propertyKey.replace(/^From/, '');
        const column = normalizedName.charAt(0).toLowerCase() + normalizedName.slice(1);
        queryBuilder.andWhere(`${alias}.${column} >= :${propertyKey}`, { [propertyKey]: value });
      } else if (propertyKey.startsWith('To')) {
        const normalizedName = propertyKey.replace(/^To/, '');
        const column = normalizedName.charAt(0).toLowerCase() + normalizedName.slice(1);
        queryBuilder.andWhere(`${alias}.${column} <= :${propertyKey}`, { [propertyKey]: value });
      } else {
        queryBuilder.andWhere(`${alias}.${entityProperty} = :${propertyKey}`, {
          [propertyKey]: value,
        });
      }
    }

    return queryBuilder;
  }
}
