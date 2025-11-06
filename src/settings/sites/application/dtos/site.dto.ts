import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class SiteDto extends BaseModelDto<number> {
        name: string;
        companyId: number;
        valueType: number;
        fixedValue: number;
        percentage: string;
        address: string;
        status: string;
}