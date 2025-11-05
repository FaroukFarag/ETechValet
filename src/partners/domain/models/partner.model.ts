import { Site } from "../../../sites/domain/models/site.model";
import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, OneToMany } from "typeorm";

@Entity()
export class Partner extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    partnerId: string;

    @Column()
    sitesNumber: number;

    @Column()
    model: string;

    @Column()
    fees: number;

    @Column()
    contactPerson: string;

    @Column()
    phoneNumber: string;

    @Column()
    email: string;

    @Column()
    status: string;

    @Column()
    contract: string;

    @OneToMany(() => Site, site => site.partner)
    sites: Site[];
}