import { SiteServiceValidator } from "../../../../settings/sites-services-validators/domain/models/site-service-validator.model";
import { Site } from "../../../../settings/sites/domain/models/site.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Check, Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Validator extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    siteId: number;

    @Column({ type: "decimal", precision: 10, scale: 2 })
    credits: number;

    @Column()
    description: string;

    @Column()
    canValidateParking: boolean;

    @Column()
    canValidateValet: boolean;

    @Column()
    discountFixedEnabled: boolean;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    discountValue: number;

    @Column()
    percentageEnabled: boolean;

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    @Check(`"percentageValue" <= 100`)
    percentageValue: number;

    @ManyToOne(() => Site, site => site.validators)
    site: Site;

    @OneToMany(() => SiteServiceValidator, siteServiceValidator => siteServiceValidator.validator)
    validatorSiteServices: SiteServiceValidator[];
}