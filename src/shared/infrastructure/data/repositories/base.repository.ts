import { Repository, DataSource, SelectQueryBuilder } from 'typeorm';
import type { EntityTarget, ObjectLiteral } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { QueryableFilterUtil } from '../filters/queryable-filter.util';
import { PaginatedModel } from 'src/shared/domain/models/paginated.model';
import { BaseSpecification } from '../specifications/base-specification';

@Injectable()
export class BaseRepository<TEntity extends ObjectLiteral, TPrimaryKey> {
  protected readonly repository: Repository<TEntity>;

  constructor(
    private readonly dataSource: DataSource,
    private readonly entity: EntityTarget<TEntity>
  ) {
    this.repository = this.dataSource.getRepository(entity);
  }

  async createAsync(entity: TEntity): Promise<TEntity> {
    return this.repository.save(entity);
  }

  async createRangeAsync(entities: TEntity[]): Promise<TEntity[]> {
    return this.repository.save(entities);
  }

  async getAsync(id: TPrimaryKey | Record<string, any>, spec?: BaseSpecification):
    Promise<TEntity | null> {
    const query = this.applySpecification(spec);

    const isCompositeKey = typeof id === 'object' && id !== null;
    const whereClause = isCompositeKey
      ? Object.entries(id)
        .map(([key]) => `${query.alias}.${key} = :${key}`)
        .join(' AND ')
      : `${query.alias}.id = :id`;

    const parameters = isCompositeKey ? id : { id };

    return await query.where(whereClause, parameters).getOne();
  }


  async getAllAsync(spec?: BaseSpecification): Promise<TEntity[]> {
    const query = this.applySpecification(spec);
    return await query.getMany();
  }

  async getAllProjectedAsync(
    columns: string[],
    spec?: BaseSpecification
  ): Promise<any[]> {
    let query = this.applySpecification(spec);
    const { selects, joins } = this.buildProjection(query, columns);

    joins.forEach(j => {
      query = query.leftJoin(j.path, j.alias);
    });

    query = query.select(selects);

    return query.getRawMany();
  }


  async getAllPaginatedAsync(
    paginatedModel: PaginatedModel,
    spec?: BaseSpecification,
  ): Promise<{ data: TEntity[]; totalCount: number }> {
    const page = paginatedModel.pageNumber <= 0 ? 1 : paginatedModel.pageNumber;
    const query = this.applySpecification(spec);

    const [data, totalCount] = await query
      .skip((page - 1) * paginatedModel.pageSize)
      .take(paginatedModel.pageSize)
      .getManyAndCount();

    return { data, totalCount };
  }

  async getAllFilteredAsync<TFilterDto>(
    filterDto: TFilterDto,
    spec?: BaseSpecification,
  ): Promise<TEntity[]> {
    if (!filterDto) throw new Error('filterDto cannot be null.');

    const query = this.applySpecification(spec);
    const alias = this.repository.metadata.tableName;

    QueryableFilterUtil.applyFilters(query, alias, filterDto);

    return await query.getMany();
  }

  async updateAsync(entity: TEntity): Promise<TEntity> {
    return this.repository.save(entity);
  }

  async updateRangeAsync(entities: TEntity[]): Promise<TEntity[]> {
    return this.repository.save(entities);
  }

  async deleteAsync(id: any): Promise<TEntity> {
    const whereCondition = typeof id === 'object' && id !== null ? id : { id };
    const entity = await this.repository.findOne({ where: whereCondition as any });

    if (!entity) {
      throw new Error(
        `Entity with key ${typeof id === 'object' ? JSON.stringify(id) : id
        } not found.`,
      );
    }

    await this.repository.remove(entity);

    return entity;
  }


  async deleteRangeAsync(entities: TEntity[]): Promise<void> {
    await this.repository.remove(entities);
  }

  async getCountAsync(spec?: BaseSpecification): Promise<number> {
    const query = this.applySpecification(spec);
    return await query.getCount();
  }

  async getSumAsync(
    column: keyof TEntity,
    spec?: BaseSpecification,
  ): Promise<number> {
    const query = this.applySpecification(spec);
    const result = await query.select(`SUM(${query.alias}.${String(column)})`, 'sum').getRawOne();
    return Number(result.sum ?? 0);
  }

  async getAverageAsync(
    column: keyof TEntity,
    spec?: BaseSpecification,
  ): Promise<number> {
    const query = this.applySpecification(spec);
    const result = await query.select(`AVG(${query.alias}.${String(column)})`, 'avg').getRawOne();
    return Number(result.avg ?? 0);
  }

  async getMaxAsync(
    column: keyof TEntity,
    spec?: BaseSpecification,
  ): Promise<any> {
    const query = this.applySpecification(spec);
    const result = await query.select(`MAX(${query.alias}.${String(column)})`, 'max').getRawOne();
    return result.max;
  }

  async getMinAsync(
    column: keyof TEntity,
    spec?: BaseSpecification,
  ): Promise<any> {
    const query = this.applySpecification(spec);
    const result = await query.select(`MIN(${query.alias}.${String(column)})`, 'min').getRawOne();
    return result.min;
  }

  private applySpecification(spec?: BaseSpecification): SelectQueryBuilder<TEntity> {
    let query = this.repository.createQueryBuilder(this.repository.metadata.tableName);

    if (!spec) return query;

    if (spec.criteria)
      query = query.andWhere(spec.criteria);

    if (spec.includes && spec.includes.length > 0) {
      const joinedAliases = new Set<string>();

      for (const include of spec.includes) {
        const parts = include.split('.');

        for (let i = 0; i < parts.length; i++) {
          const currentPart = parts[i];
          const currentPath = parts.slice(0, i + 1).join('.');

          if (joinedAliases.has(currentPath)) {
            continue;
          }

          if (i === 0) {
            query = query.leftJoinAndSelect(`${query.alias}.${currentPart}`, currentPart);
          } else {
            const previousAlias = parts[i - 1];
            query = query.leftJoinAndSelect(`${previousAlias}.${currentPart}`, currentPart);
          }

          joinedAliases.add(currentPath);
        }
      }
    }

    if (spec.orderBy) {
      const order = spec.orderBy.includes('.')
        ? spec.orderBy
        : `${query.alias}.${spec.orderBy}`;

      query = query.orderBy(order, 'ASC');
    }


    if (spec.orderByDescending) {
      const orderByDescending = spec.orderByDescending.includes('.')
        ? spec.orderByDescending
        : `${query.alias}.${spec.orderByDescending}`;

      query = query.orderBy(orderByDescending, 'DESC');
    }

    return query;
  }

  private buildProjection(
    query: SelectQueryBuilder<TEntity>,
    projections: string[]
  ) {
    const selects: string[] = [];
    const joins: { path: string; alias: string }[] = [];

    projections.forEach(p => {
      let [path, alias] = p.split(/\s+as\s+/i).map(v => v.trim());

      const parts = path.split(".");

      if (parts.length === 2) {
        const relation = parts[0];
        const column = parts[1];
        const joinAlias = relation;

        joins.push({
          path: `${query.alias}.${relation}`,
          alias: joinAlias
        });

        selects.push(
          `${joinAlias}.${column} AS "${alias ?? relation + column.charAt(0).toUpperCase() + column.slice(1)}"`
        );
      } else {
        selects.push(
          `${query.alias}.${path} AS "${alias ?? path}"`
        );
      }
    });

    return { selects, joins };
  }
}