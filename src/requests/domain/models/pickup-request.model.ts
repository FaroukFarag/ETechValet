import { User } from "../../../settings/users/domain/models/user.model";
import { RequestSiteService } from "../../../requests-sites-services/domain/models/request-site-service.model";
import { Gate } from "../../../settings/gates/domain/models/gate.model";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { InspectionPhoto } from "./inspection-photo.model";
import { BaseRequest } from "./base-request";
import { RecallRequest } from "./recall-request.model";
import { PaymentType } from "../enums/payment-type.enum";
import { PickupRequestStatus } from "../enums/pickup-request-status.enum";
import { CustomerType } from "../../../settings/customer-types/domain/models/customer-type.model";
import { Note } from "../../../notes/domain/models/note.model";
import { Shift } from "../../../shifts/domain/models/shift.model";
import { Receipt } from "../../../receipts/domain/models/receipt.model";

@Entity()
export class PickupRequest extends BaseRequest {
    @Column()
    customerTypeId: number;

    @Column({ type: "enum", enum: PaymentType })
    paymentType: PaymentType;

    @Column({ nullable: true })
    brand?: string;

    @Column({ nullable: true })
    color?: string;

    @Column({ type: "enum", enum: PickupRequestStatus })
    status: PickupRequestStatus;

    @Column()
    startTime: Date;

    @Column({default: ''})
    parkingLocation: string;

    @Column({ nullable: true })
    endTime: Date;

    @Column()
    receivedById: number;

    @Column()
    shiftId: number;

    @Column({ nullable: true })
    parkedById?: number;

    @Column({ nullable: true })
    recallRequestId?: number;

    @Column({ nullable: true })
    receiptId?: number;

    @ManyToOne(() => CustomerType, customerType => customerType.pickupRequests)
    customerType: CustomerType;

    @ManyToOne(() => Gate, gate => gate.pickupRequests)
    gate: Gate;

    @ManyToOne(() => User, user => user.receivedRequests)
    receivedBy: User;

    @ManyToOne(() => User, user => user.parkedRequests)
    parkedBy: User;

    @ManyToOne(() => Shift, shift => shift.requests)
    shift: Shift;

    @OneToOne(() => RecallRequest, recallRequest => recallRequest.pickupRequest)
    @JoinColumn({ name: "recallRequestId" })
    recallRequest: RecallRequest;

    @OneToMany(() => Note, note => note.request)
    notes: Note[];

    @OneToMany(() => RequestSiteService, rss => rss.request)
    requestSiteServices: RequestSiteService[];

    @OneToMany(() => InspectionPhoto, inspectionPhoto => inspectionPhoto.pickupRequest)
    inspectionPhotos: InspectionPhoto[];

    @OneToOne(() => Receipt, receipt => receipt.request)
    @JoinColumn({ name: "receiptId" })
    receipt: Receipt;
}