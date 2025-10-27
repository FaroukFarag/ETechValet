import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BaseRepository } from 'src/shared/infrastructure/data/repositories/base.repository';
import { ObjectLiteral } from 'typeorm';
import { ResultDto } from '../dtos/result.dto';
import { PaginatedModelDto } from '../dtos/paginated.model.dto';
import { PaginatedModel } from 'src/shared/domain/models/paginated.model';

@Injectable()
export abstract class BaseService<
  TCreateEntityDto,
  TGetAllEntitiesDto,
  TGetEntityDto,
  TUpdateEntityDto,
  TEntity extends ObjectLiteral,
  TPrimaryKey,
> {
  constructor(
    protected readonly repository: BaseRepository<TEntity, TPrimaryKey>
  ) {}

  protected map<T, U>(source: T, targetClass: new () => U): U {
    return plainToInstance(targetClass, source, {
      excludeExtraneousValues: false,
      enableImplicitConversion: true,
    });
  }

  protected mapArray<T, U>(sources: T[], targetClass: new () => U): U[] {
    return sources.map((source) => this.map(source, targetClass));
  }

  async create(
    createEntityDto: TCreateEntityDto,
    entityClass: new () => TEntity,
  ): Promise<ResultDto<TCreateEntityDto>> {
    return this.executeServiceCall(
      `Create ${entityClass.name}`,
      async () => {
        const entity = this.map(createEntityDto, entityClass);

        await this.repository.createAsync(entity);

        return createEntityDto;
      },
    );
  }

  async createRange(
    createEntitiesDtos: TCreateEntityDto[],
    entityClass: new () => TEntity,
  ): Promise<ResultDto<boolean>> {
    return this.executeServiceCall(
      `Create multiple ${entityClass.name}`,
      async () => {
        const entities = this.mapArray(createEntitiesDtos, entityClass);

        const createdEntities = await this.repository.createRangeAsync(entities);

        return createdEntities.length == entities.length;
      },
    );
  }

  async getById(
    id: TPrimaryKey,
    entityClass: new () => TEntity,
    getDtoClass: new () => TGetEntityDto,
  ): Promise<ResultDto<TGetEntityDto>> {
    return this.executeServiceCall(
      `Get ${entityClass.name} by ID`,
      async () => {
        const entity = await this.repository.getAsync(id);

        if (!entity) {
          throw new Error(`${entityClass.name} with id ${id} not found`);
        }

        return this.map(entity, getDtoClass);
      },
    );
  }

  async getAll(
    entityClass: new () => TEntity,
    getAllDtoClass: new () => TGetAllEntitiesDto,
  ): Promise<ResultDto<TGetAllEntitiesDto[]>> {
    return this.executeServiceCall(`Get all ${entityClass.name}`, async () => {
      const entities = await this.repository.getAllAsync();

      return this.mapArray(entities, getAllDtoClass);
    });
  }

  async getAllPaginated(
    paginatedModelDto: PaginatedModelDto,
    entityClass: new () => TEntity,
    getAllDtoClass: new () => TGetAllEntitiesDto,
  ): Promise<ResultDto<TGetAllEntitiesDto[]>> {
    return this.executeServiceCall(
      `Get paginated ${entityClass.name}`,
      async () => {
        const paginatedModel = this.map(paginatedModelDto, PaginatedModel);
        const entities = await this.repository.getAllPaginatedAsync(paginatedModel);

        return this.mapArray(entities, getAllDtoClass);
      },
    );
  }

  async getAllFiltered<TFilterDto>(
    filterDto: TFilterDto,
    entityClass: new () => TEntity,
    getAllDtoClass: new () => TGetAllEntitiesDto,
  ): Promise<ResultDto<TGetAllEntitiesDto[]>> {
    return this.executeServiceCall(
      `Get filtered ${entityClass.name}`,
      async () => {
        const entities = await this.repository.getAllFilteredAsync(filterDto);

        return this.mapArray(entities, getAllDtoClass);
      },
    );
  }

  async update(
    updateEntityDto: TUpdateEntityDto,
    entityClass: new () => TEntity,
  ): Promise<ResultDto<TUpdateEntityDto>> {
    return this.executeServiceCall(
      `Update ${entityClass.name}`,
      async () => {
        const entity = this.map(updateEntityDto, entityClass);

        this.repository.updateAsync(entity);
        
        return updateEntityDto;
      },
    );
  }

  async updateRange(
    updateEntitiesDtos: TUpdateEntityDto[],
    entityClass: new () => TEntity,
  ): Promise<ResultDto<boolean>> {
    return this.executeServiceCall(
      `Update multiple ${entityClass.name}`,
      async () => {
        const entities = this.mapArray(updateEntitiesDtos, entityClass);

        const updateEntities = await this.repository.updateRangeAsync(entities);

        return entities.length == updateEntities.length;
      },
    );
  }

  async delete(
    id: TPrimaryKey,
    entityClass: new () => TEntity,
    getDtoClass: new () => TGetEntityDto,
  ): Promise<ResultDto<TGetEntityDto>> {
    return this.executeServiceCall(
      `Delete ${entityClass.name} by ID`,
      async () => {
        const entity = this.repository.deleteAsync(id);

        return this.map(entity, getDtoClass);
      },
    );
  }

  async deleteRange(
    getAllEntitiesDtos: TGetAllEntitiesDto[],
    entityClass: new () => TEntity,
  ): Promise<ResultDto<void>> {
    return this.executeServiceCall(
      `Delete multiple ${entityClass.name}`,
      async () => {
        const entities = this.mapArray(getAllEntitiesDtos, entityClass);

        await this.repository.deleteRangeAsync(entities);
      },
    );
  }

  protected async executeServiceCall<T>(
    operationName: string,
    action: () => Promise<T>,
  ): Promise<ResultDto<T>> {
    try {
      const result = await action();
      return ResultDto.createSuccessResult(result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      return ResultDto.createFailResult(
        `${operationName} failed: ${errorMessage}`,
      );
    }
  }
}
