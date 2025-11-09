import { User } from "../../../settings/users/domain/models/user.model";
import { Column, Entity, ManyToOne, OneToOne } from "typeorm";
import { BaseRequest } from "./base-request";
import { Gate } from "../../../settings/gates/domain/models/gate.model";
import { PickupRequest } from "./pickup-request.model";

@Entity()
export class RecallRequest extends BaseRequest {
    @Column()
    parkingLocation: string;

    @Column()
    deliveredById: number;

    @Column()
    pickupRequestId: number;

    @ManyToOne(() => User, user => user.deliveredRequests)
    deliveredBy: User;

    @ManyToOne(() => Gate, gate => gate.recallRequests)
    gate: Gate;

    @OneToOne(() => PickupRequest, pickupRequest => pickupRequest.recallRequest)
    pickupRequest: PickupRequest;
}