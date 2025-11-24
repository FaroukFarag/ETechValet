import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column } from "typeorm";

export class BaseRequest extends BaseModel<number> {
    @Column()
    plateType: number;

    @Column()
    plateNumber: string;

    @Column({ nullable: true })
    cardNumber?: number;

    @Column({ nullable: true })
    customerMobileNumber?: string;

    @Column()
    gateId: number;
}