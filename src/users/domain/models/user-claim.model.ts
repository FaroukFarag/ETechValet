import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.model";

@Entity()
export class UserClaim extends BaseModel<number> {
    @Column()
    userId: string;

    @Column()
    claimType: string;

    @Column()
    claimValue: string;

    @ManyToOne(() => User, user => user.userClaims)
    user: User;
}
