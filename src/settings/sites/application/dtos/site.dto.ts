import { IsOptional, Max } from "class-validator";
import { CompanyDto } from "src/settings/companies/application/dtos/company.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class SiteDto extends BaseModelDto<number> {
        name: string;
        companyName: string;
        companyId: number;
        valueType: number;

        @IsOptional()
        fixedValue?: number;

        @IsOptional()
        @Max(100)
        percentage?: number;

        address: string;
        status: number;
        company: CompanyDto;
}