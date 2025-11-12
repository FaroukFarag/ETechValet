import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pricing } from "./pricing.model";
import { WeekDay } from "../enums/week-day.enum";
import { WeekDayPricingType } from "../enums/week-day-pricing-type.enum";
import { BaseModel } from "../../../../shared/domain/models/base-model";

@Entity()
export class WeekDayPricing extends BaseModel<number> {
    @Column({ type: "enum", enum: WeekDayPricingType })
    weekDayPricingType: WeekDayPricingType;

    @Column({ type: "enum", enum: WeekDay })
    dayOfWeek: WeekDay;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyRate: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    hourlyRate: number;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    dailyMaxRate: number;

    @Column()
    pricingId: number;

    @ManyToOne(() => Pricing, pricing => pricing.weekDayPricings)
    pricing: Pricing;
}
