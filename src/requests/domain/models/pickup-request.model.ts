import { User } from "../../../settings/users/domain/models/user.model";
import { RequestSiteService } from "../../../requests-sites-services/domain/models/request-site-service.model";
import { Gate } from "../../../settings/gates/domain/models/gate.model";
import { Column, Entity, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { InspectionPhoto } from "./inspection-photo.model";
import { BaseRequest } from "./base-request";
import { RecallRequest } from "./recall-request.model";
import { CustomerType } from "../../../settings/pricings/domain/enums/customer-type.enum";
import { PaymentType } from "../enums/payment-type.enum";

@Entity()
export class PickupRequest extends BaseRequest {
    @Column({ type: "enum", enum: CustomerType })
    customerType: CustomerType;

    @Column({ type: "enum", enum: PaymentType })
    paymentType: PaymentType;

    @Column({ nullable: true })
    brand?: string;

    @Column({ nullable: true })
    color?: string;

    @Column({ nullable: true })
    notes?: string;

    @Column()
    receivedById: number;

    @Column({ nullable: true })
    parkedById?: number;

    @Column({ nullable: true })
    recallRequestId?: number;

    @ManyToOne(() => Gate, gate => gate.pickupRequests)
    gate: Gate;

    @ManyToOne(() => User, user => user.receivedRequests)
    receivedBy: User;

    @ManyToOne(() => User, user => user.parkedRequests)
    parkedBy: User;

    @OneToOne(() => RecallRequest, recallRequest => recallRequest.pickupRequest)
    recallRequest: RecallRequest;

    @OneToMany(() => RequestSiteService, rss => rss.request)
    requestSiteServices: RequestSiteService[];

    @OneToMany(() => InspectionPhoto, inspectionPhoto => inspectionPhoto.pickupRequest)
    inspectionPhotos: InspectionPhoto[];
}