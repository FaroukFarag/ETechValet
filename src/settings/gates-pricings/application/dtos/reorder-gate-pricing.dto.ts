import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class ReOrderGatePricingDto extends BaseModelDto<{ gateId: number, pricingId: number }> {
    order: number;
}