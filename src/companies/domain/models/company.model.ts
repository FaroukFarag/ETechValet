import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity } from "typeorm";

@Entity()
export class Company extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    shortName: string;

     @Column()
    contactPerson: string;

    @Column()
    phoneNumber: string;

    @Column()
    address: string;

    @Column()
    commercialRegistration: string;
}