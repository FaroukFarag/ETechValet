import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpStatus,
    HttpCode,
    ParseIntPipe,
    BadRequestException,
    NotFoundException,
    Query
} from '@nestjs/common';
import { Pricing } from '../../entities/pricing.model';
import { PricingService } from '../../services/pricing.service';
import { ResultDto } from 'src/shared/application/dtos/result.dto';
import { ReorderPricingsDto } from '../../dtos/reorder-pricings.dto';

@Controller('api/pricings')
export class PricingController {
    constructor(private readonly pricingService: PricingService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() pricingDto: Partial<Pricing>): Promise<ResultDto<Pricing>> {
        try {
            const pricing = await this.pricingService.create(pricingDto);
            return ResultDto.createSuccessResult<Pricing>(pricing);
        } catch (error) {
            throw new BadRequestException(
                ResultDto.createFailResult<Pricing>(`Failed to create pricing: ${error.message}`)
            );
        }
    }

    @Get()
    async find(@Query('gate') gateId?: number, @Query('site') siteId?: number) {
        if ((!gateId && !siteId) || (gateId && siteId)) {
            throw new BadRequestException('You must provide either gate or site');
        }

        if (gateId) {
            const pricings = await this.pricingService.findByGate(Number(gateId));
            return ResultDto.createSuccessResult(pricings);
        }

        const pricings = await this.pricingService.findBySite(Number(siteId));
        return ResultDto.createSuccessResult(pricings);
    }

    @Put(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePricingDto: Partial<Pricing>,
    ): Promise<ResultDto<Pricing>> {
        try {
            const pricing = await this.pricingService.update(id, updatePricingDto);
            return ResultDto.createSuccessResult(pricing);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new BadRequestException(
                    ResultDto.createFailResult<Pricing>(error.message)
                );
            }
            throw new BadRequestException(
                ResultDto.createFailResult<Pricing>(`Failed to update pricing: ${error.message}`)
            );
        }
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    async remove(@Param('id', ParseIntPipe) id: number): Promise<ResultDto<void>> {
        try {
            await this.pricingService.remove(id);
            return ResultDto.createSuccessResult(undefined);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new BadRequestException(
                    ResultDto.createFailResult<void>(error.message)
                );
            }
            throw new BadRequestException(
                ResultDto.createFailResult<void>(`Failed to delete pricing: ${error.message}`)
            );
        }
    }

    @Put('reorder')
    @HttpCode(HttpStatus.OK)
    async reorderPricings(@Body() reorderDto: ReorderPricingsDto): Promise<ResultDto<number[]>> {
        await this.pricingService.reorderPricings(reorderDto);

        // Return the new order for confirmation
        const reference = { siteId: reorderDto.siteId, gateId: reorderDto.gateId };
        const newOrder = await this.pricingService.getPricingOrder(reference);

        return ResultDto.createSuccessResult<number[]>(newOrder)
    }

}