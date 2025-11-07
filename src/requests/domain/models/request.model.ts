import { Service } from "src/settings/services/domain/models/service.model";
import { Gate } from "../../../settings/gates/domain/models/gate.model";
import { Site } from "../../../settings/sites/domain/models/site.model";
import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Request extends BaseModel<number> {
    @Column()
    customerType: number;

    @Column()
    customerMobileNumber: number;

    @Column()
    cardNumber: number;

    @Column()
    siteId: number;

    @Column()
    gateId: number;

    @ManyToOne(() => Site, site => site.requests)
    site: Site;

    @ManyToOne(() => Gate, gate => gate.requests)
    gate: Gate;
}