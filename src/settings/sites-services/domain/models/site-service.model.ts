import { BaseModel } from "../../../../shared/domain/models/base-model";
import { RequestSiteService } from "../../../../requests-sites-services/domain/models/request-site-service.model";
import { Service } from "../../../services/domain/models/service.model";
import { Site } from "../../../sites/domain/models/site.model";
import { Column, Entity, ManyToOne, OneToMany, PrimaryColumn } from "typeorm";

@Entity()
export class SiteService {
    @PrimaryColumn()
    siteId: number;

    @PrimaryColumn()
    serviceId: number;

    @Column()
    amount: number;

    @ManyToOne(() => Site, site => site.siteServices)
    site: Site

    @ManyToOne(() => Service, service => service.serviceSites)
    service: Service

    @OneToMany(() => RequestSiteService, rss => rss.siteService)
    requestSiteServices: RequestSiteService[];
}