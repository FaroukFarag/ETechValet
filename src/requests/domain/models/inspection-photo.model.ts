import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne } from "typeorm";
import { PickupRequest } from "./pickup-request.model";

@Entity()
export class InspectionPhoto extends BaseModel<number> {
    @Column()
    imagePath: string;

    @Column()
    pickupRequestId: number;

    @ManyToOne(() => PickupRequest, pickupRequest => pickupRequest.inspectionPhotos)
    pickupRequest: PickupRequest;
}