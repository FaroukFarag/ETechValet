import { PickupRequest } from "../../../requests/domain/models/pickup-request.model";
import { SiteService } from "../../../settings/sites-services/domain/models/site-service.model";
import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class RequestSiteService {
    @PrimaryColumn()
    pickupRequestId: number;

    @PrimaryColumn()
    siteId: number;

    @PrimaryColumn()
    serviceId: number;

    @Column()
    status: number;

    @ManyToOne(() => PickupRequest, request => request.requestSiteServices)
    request: PickupRequest;

    @ManyToOne(() => SiteService, siteService => siteService.requestSiteServices)
    siteService: SiteService;
}