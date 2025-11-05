import { Gate } from "../../../gates/domain/models/gate.model";
import { Partner } from "../../../partners/domain/models/partner.model";
import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Site extends BaseModel<number> {
    @Column()
    partnerId: number;

    @Column()
    siteId: string;

    @Column()
    name: string;

    @Column()
    gatesNumber: number;

    @Column()
    city: string;

    @Column()
    address: string;

    @Column()
    status: string;

    @ManyToOne(() => Partner, partner => partner.sites)
    partner: Partner;

    @OneToMany(() => Gate, gate => gate.site)
    gates: Gate[];
}