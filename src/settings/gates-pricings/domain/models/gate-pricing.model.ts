import { Gate } from "../../../../settings/gates/domain/models/gate.model";
import { Pricing } from "../../../../settings/pricings/domain/models/pricing.model";
import { Entity, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class GatePricing {
    @PrimaryColumn()
    pricingId: number;

    @PrimaryColumn()
    gateId: number;

    @ManyToOne(() => Pricing, pricing => pricing.pricingGates)
    pricing: Pricing;

    @ManyToOne(() => Gate, gate => gate.gatePricings)
    gate: Gate;
}