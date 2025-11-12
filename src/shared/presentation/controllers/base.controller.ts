import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Post,
    Put
} from '@nestjs/common';
import { ResultDto } from '../../application/dtos/result.dto';
import { PaginatedModelDto } from '../../application/dtos/paginated.model.dto';
import { BaseService } from '../../application/services/base.service';
import { ObjectLiteral } from 'typeorm';
import { BaseModelDto } from 'src/shared/application/dtos/base-model.dto';

@Controller()
export abstract class BaseController<
    TService extends BaseService<
        TCreateEntityDto,
        TGetAllEntitiesDto,
        TGetEntityDto,
        TUpdateEntityDto,
        TEntity,
        TPrimaryKey
    >,
    TCreateEntityDto,
    TGetAllEntitiesDto,
    TGetEntityDto,
    TUpdateEntityDto extends BaseModelDto<TPrimaryKey>,
    TEntity extends ObjectLiteral,
    TPrimaryKey
> {
    constructor(protected readonly service: TService) { }

    @Post('create')
    async create(@Body() createEntityDto: TCreateEntityDto): Promise<ResultDto<TCreateEntityDto>> {
        return this.service.create(createEntityDto, Object as any, Object as any);
    }

    @Post('create-range')
    async createRange(@Body() createEntitiesDtos: TCreateEntityDto[]): Promise<ResultDto<boolean>> {
        return this.service.createRange(createEntitiesDtos, Object as any);
    }

    @Get('get/:id')
    async get(@Param('id') id: TPrimaryKey): Promise<ResultDto<TGetEntityDto>> {
        return this.service.getById(id, Object as any, Object as any);
    }

    @Get('get-all')
    async getAll(): Promise<ResultDto<TGetAllEntitiesDto[]>> {
        return this.service.getAll(Object as any, Object as any);
    }

    @Post('get-all-paginated')
    async getAllPaginated(
        @Body() paginatedModelDto: PaginatedModelDto,
    ): Promise<ResultDto<TGetAllEntitiesDto[]>> {
        return this.service.getAllPaginated(paginatedModelDto, Object as any);
    }

    @Put('update')
    async update(@Body() updateEntityDto: TUpdateEntityDto): Promise<ResultDto<TUpdateEntityDto>> {
        return this.service.update(updateEntityDto, Object as any);
    }

    @Put('update-range')
    async updateRange(
        @Body() updateEntitiesDtos: TUpdateEntityDto[],
    ): Promise<ResultDto<boolean>> {
        return this.service.updateRange(updateEntitiesDtos, Object as any);
    }

    @Delete('delete/:id')
    async delete(@Param('id') id: TPrimaryKey): Promise<ResultDto<TGetEntityDto>> {
        return this.service.delete(id, Object as any, Object as any);
    }

    @Delete('delete-range')
    async deleteRange(
        @Body() getAllEntitiesDtos: TGetAllEntitiesDto[],
    ): Promise<ResultDto<void>> {
        return this.service.deleteRange(getAllEntitiesDtos, Object as any);
    }

    protected getCurrentUserId(req: any): number {
        const userId = req.user?.userId;
        if (!userId) {
            throw new Error('User ID not found in request.');
        }
        return Number(userId);
    }
}
