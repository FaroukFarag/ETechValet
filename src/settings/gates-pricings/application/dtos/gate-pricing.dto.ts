import { GateDto } from "src/settings/gates/application/dtos/gate.dto";
import { PricingDto } from "src/settings/pricings/application/dtos/pricing.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class GatePricingDto extends BaseModelDto<{ pricingId: number, gateId: number }> {
    pricing: PricingDto;
    gate: GateDto;
}