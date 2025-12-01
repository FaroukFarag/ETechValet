import { Check, Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Site } from "../../../../settings/sites/domain/models/site.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { PricingType } from "../enums/pricing-type.enum";
import { GatePricing } from "../../../../settings/gates-pricings/domain/models/gate-pricing.model";
import { WeekDayPricing } from "./week-day-pricing.model";
import { CustomerType } from "../../../../settings/customer-types/domain/models/customer-type.model";

@Entity()
export class Pricing extends BaseModel<number> {
    @Column()
    siteId: number;

    @Column({ nullable: true })
    customerTypeId: number |undefined;

    @Column({ type: "enum", enum: PricingType })
    pricingType: PricingType;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyRate: number;

    @Column()
    @Check(`"freeHours" <= 24`)
    freeHours: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    hourlyRate: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyMaxRate: number;

    @Column()
    parkingEnabled: boolean;

    @Column({ type: "enum", enum: PricingType })
    parkingPricingType: PricingType;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    parkingDailyRate: number;

    @Column({ nullable: true })
    @Check(`"parkingFreeHours" <= 24`)
    parkingFreeHours: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    parkingHourlyRate: number;

    @Column()
    order: number;

    @ManyToOne(() => Site, site => site.pricings)
    site: Site;

    @ManyToOne(() => CustomerType, customerType => customerType.pricings)
    customerType: CustomerType;

    @OneToMany(() => GatePricing, pricingGate => pricingGate.pricing)
    pricingGates: GatePricing[];

    @OneToMany(() => WeekDayPricing, weekDayPricing => weekDayPricing.pricing)
    weekDayPricings: WeekDayPricing[];
}
