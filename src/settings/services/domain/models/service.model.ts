import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, Entity } from "typeorm";

@Entity()
export class Service extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    status: number;
}