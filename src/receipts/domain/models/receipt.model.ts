import { PickupRequest } from "../../../requests/domain/models/pickup-request.model";
import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, OneToOne } from "typeorm";

@Entity()
export class Receipt extends BaseModel<number> {
    @Column()
    extraServices: number;

    @Column()
    valet: number;

    @Column()
    parking: number;

    @Column()
    tax: number;

    @Column()
    requestId: number;

    @OneToOne(() => PickupRequest, pickupRequest => pickupRequest.receipt)
    request: PickupRequest;
}