import { Request } from "../../../../requests/domain/models/request.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Site } from "../../../sites/domain/models/site.model";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Gate extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    siteId: number;

    @Column()
    status: number;

    @ManyToOne(() => Site, site => site.gates)
    site: Site;

    @OneToMany(() => Request, request => request.gate)
    requests: Request[];
}