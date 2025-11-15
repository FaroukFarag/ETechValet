import { Gate } from "src/settings/gates/domain/models/gate.model";
import { Site } from "src/settings/sites/domain/models/site.model";
import { CustomerType } from "../enums/customer-type.enum";
import { PricingType } from "../enums/pricing-type.enum";
import { BaseEntity, Check, Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { DayOfWeek } from "../enums/week-day.enum";

@Entity()
@Check('CHK_GATE_SITE', `("siteId" IS NOT NULL) OR ("gateId" IS NOT NULL)`)
export class Pricing extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'int' })
    order: number;

    @Column({ nullable: true })
    customerType: CustomerType

    // Valet Pricing
    @Column()
    valetEnabled: boolean

    @Column({ nullable: true })
    valetPricingType: PricingType

    @Column({ nullable: true })
    valetValue: number

    @Column({ nullable: true })
    valetMaxValue: number

    // Parking Pricing
    @Column()
    parkingEnabled: boolean

    @Column({ nullable: true })
    parkingPricingType: PricingType

    @Column({ nullable: true })
    parkingValue: number

    @Column({ nullable: true })
    parkingMaxValue: number

    @Column({ default: 0 })
    FreeMinutes: number

    @Column('simple-array')
    activeDays: DayOfWeek[]

    @ManyToOne(() => Site, site => site.pricings, { nullable: true })
    site: Site

    @ManyToOne(() => Gate, gate => gate.pricings, { nullable: true })
    gate: Gate

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date

}