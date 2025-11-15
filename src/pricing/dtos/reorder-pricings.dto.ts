import { IsArray, IsNumber, IsOptional, ValidateIf } from "class-validator";

export class ReorderPricingsDto {
    @IsArray()
    @IsNumber({}, { each: true })
    pricingIds: number[];

    @IsOptional()
    @IsNumber()
    @ValidateIf(o => !o.gateId)
    siteId?: number;

    @IsOptional()
    @IsNumber()
    @ValidateIf(o => !o.siteId)
    gateId?: number;
}