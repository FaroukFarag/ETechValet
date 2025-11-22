import { BaseModel } from "../../../shared/domain/models/base-model";
import { User } from "../../../settings/users/domain/models/user.model";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Shift extends BaseModel<number> {
    @Column()
    startTime: Date;

    @Column({ nullable: true })
    endTime: Date;

    @Column()
    userId: number;

    @ManyToOne(() => User, user => user.shifts)
    user: User;
}