import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { Site } from "../../../../settings/sites/domain/models/site.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { CustomerType } from "../enums/customer-type.enum";
import { PricingType } from "../enums/pricing-type.enum";
import { GatePricing } from "../../../../settings/gates-pricings/domain/models/gate-pricing.model";
import { ParkingPricingType } from "../enums/parking-pricing-type";
import { WeekDayPricing } from "./week-day-pricing.model";

@Entity()
export class Pricing extends BaseModel<number> {
    @Column()
    siteId: number;

    @Column({ type: "enum", enum: CustomerType })
    customerType: CustomerType;

    @Column({ type: "enum", enum: PricingType })
    pricingType: PricingType;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyRate: number;

    @Column()
    freeHours: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    hourlyRate: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyMaxRate: number;

    @Column()
    parkingEnabled: boolean;

    @Column({ type: "enum", enum: ParkingPricingType })
    parkingPricingType: ParkingPricingType;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    parkingDailyRate: number;

    @Column({ nullable: true })
    parkingFreeHours: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    parkingHourlyRate: number;

    @Column({ default: false })
    applyToAllGates: boolean;

    @Column({ default: false })
    weekDayBasedEnabled: boolean;

    @ManyToOne(() => Site, site => site.pricings)
    site: Site;

    @OneToMany(() => GatePricing, pricingGate => pricingGate.pricing)
    pricingGates: GatePricing[];

    @OneToMany(() => WeekDayPricing, weekDayPricing => weekDayPricing.pricing)
    weekDayPricings: WeekDayPricing[];
}
