import { SiteService } from "../../../sites-services/domain/models/site-service.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, Entity, OneToMany } from "typeorm";

@Entity()
export class Service extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    status: number;

    @OneToMany(() => SiteService, siteService => siteService.service)
    serviceSites: SiteService[];
}