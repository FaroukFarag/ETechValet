import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";
import { User } from "./user.model";

@Entity()
export class RefreshToken extends BaseModel<number> {
    @Column()
    userId: number;

    @Column({ unique: true })
    token: string;

    @Column({ type: 'timestamp' })
    expiresAt: Date;

    @Column({ default: false })
    isRevoked: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
