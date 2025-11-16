import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class ReOrderPricingDto extends BaseModelDto<number> {
    order: number;
}