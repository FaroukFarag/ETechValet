import { PickupRequest } from "../../../requests/domain/models/pickup-request.model";
import { User } from "../../../settings/users/domain/models/user.model";
import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Note extends BaseModel<number> {
    @Column()
    message: string;

    @Column()
    requestId: number;

    @Column()
    userId: number;

    @ManyToOne(() => PickupRequest, pickupRequest => pickupRequest.notes)
    request: PickupRequest;

    @ManyToOne(() => User, user => user.notes)
    user: User;
}