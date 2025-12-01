import { User } from "../../../settings/users/domain/models/user.model";
import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { Gate } from "../../../settings/gates/domain/models/gate.model";
import { PickupRequest } from "./pickup-request.model";
import { BaseModel } from "../../../shared/domain/models/base-model";
import { RecallRequestStatus } from "../enums/recall-request-status.enum";

@Entity()
export class RecallRequest extends BaseModel<number> {
    @Column({ type: "enum", enum: RecallRequestStatus, default: RecallRequestStatus.Created })
    status: RecallRequestStatus;

    @Column()
    recalledById: number;

    @Column({ nullable: true })
    deliveredById: number;

    @Column()
    gateId: number;

    @Column()
    pickupRequestId: number;

    @Column({ nullable: true })
    notes: string;

    @ManyToOne(() => User, user => user.recalledRequests)
    recalledBy: User;

    @ManyToOne(() => User, user => user.deliveredRequests)
    deliveredBy: User;

    @ManyToOne(() => Gate, gate => gate.recallRequests)
    gate: Gate;

    @OneToOne(() => PickupRequest, pickupRequest => pickupRequest.recallRequest)
    pickupRequest: PickupRequest;
}