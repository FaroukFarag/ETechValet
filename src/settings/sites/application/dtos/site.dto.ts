import { IsOptional, Max } from "class-validator";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class SiteDto extends BaseModelDto<number> {
        name: string;
        companyId: number;
        valueType: number;

        @IsOptional()
        fixedValue?: number;

        @IsOptional()
        @Max(100)
        percentage?: number;

        address: string;
        status: number;
}