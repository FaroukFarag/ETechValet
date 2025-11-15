import { RecallRequest } from "../../../../requests/domain/models/recall-request.model";
import { PickupRequest } from "../../../../requests/domain/models/pickup-request.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Site } from "../../../sites/domain/models/site.model";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { UserGate } from "../../../../settings/users-gates/domain/models/user-gate.model";
import { Pricing } from "src/pricing/entities/pricing.model";

@Entity()
export class Gate extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    siteId: number;

    @Column()
    status: number;

    @OneToMany(() => Pricing, pricing => pricing.gate)
    pricings: Pricing[]

    @ManyToOne(() => Site, site => site.gates)
    site: Site;

    @OneToMany(() => PickupRequest, pickupRequest => pickupRequest.gate)
    pickupRequests: PickupRequest[];

    @OneToMany(() => RecallRequest, recallRequest => recallRequest.gate)
    recallRequests: RecallRequest[];

    @OneToMany(() => UserGate, gateUser => gateUser.gate)
    gateUsers: UserGate[];
}