import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "./user.model";

@Entity()
export class ResetPasswordToken extends BaseModel<number> {
    @Column()
    userId: number;

    @Column()
    token: string;

    @Column()
    expiresAt: Date;

    @Column()
    isUsed: boolean;

    @ManyToOne(() => User, user => user.resetPasswordTokens)
    user: User;
}
