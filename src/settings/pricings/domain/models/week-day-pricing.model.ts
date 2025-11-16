import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Pricing } from "./pricing.model";
import { WeekDay } from "../enums/week-day.enum";
import { BaseModel } from "../../../../shared/domain/models/base-model";

@Entity()
export class WeekDayPricing extends BaseModel<number> {

    @Column({ type: "enum", enum: WeekDay })
    dayOfWeek: WeekDay;
    
    @Column()
    pricingId: number;

    @ManyToOne(() => Pricing, pricing => pricing.weekDayPricings)
    pricing: Pricing;
}
