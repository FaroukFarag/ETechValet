import { PickupRequest } from "../../../requests/domain/models/pickup-request.model";
import { SiteService } from "../../../settings/sites-services/domain/models/site-service.model";
import { Column, Entity, ManyToOne, PrimaryColumn } from "typeorm";
import { RequestSiteServiceStatus } from "../enums/request-site-service-status.enum";

@Entity()
export class RequestSiteService {
    @PrimaryColumn()
    pickupRequestId: number;

    @PrimaryColumn()
    siteId: number;

    @PrimaryColumn()
    serviceId: number;

    @Column({ type: "enum", enum: RequestSiteServiceStatus })
    status: RequestSiteServiceStatus;

    @Column({ nullable: true })
    notes: string;

    @ManyToOne(() => PickupRequest, request => request.requestSiteServices)
    request: PickupRequest;

    @ManyToOne(() => SiteService, siteService => siteService.requestSiteServices)
    siteService: SiteService;
}