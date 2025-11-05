import { BaseModel } from "../../../shared/domain/models/base-model";
import { Site } from "../../../sites/domain/models/site.model";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Gate extends BaseModel<number> {
    @Column()
    gateId: string;

    @Column()
    name: string;

    @Column()
    type: string;

    @Column()
    siteId: number;

    @Column()
    status: string;

    @ManyToOne(() => Site, site => site.gates)
    site: Site;
}