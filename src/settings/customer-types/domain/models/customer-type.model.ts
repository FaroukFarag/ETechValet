import { PickupRequest } from "../../../../requests/domain/models/pickup-request.model";
import { Pricing } from "../../../../settings/pricings/domain/models/pricing.model";
import { Site } from "../../../../settings/sites/domain/models/site.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class CustomerType extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    siteId: number;

    @ManyToOne(() => Site, site => site.customerTypes)
    site: Site;

    @OneToMany(() => Pricing, pricing => pricing.customerType)
    pricings: Pricing[];

    @OneToMany(() => PickupRequest, pickupRequest => pickupRequest.customerType)
    pickupRequests: PickupRequest[];
}