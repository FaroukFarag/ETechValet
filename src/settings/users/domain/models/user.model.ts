import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { UserRole } from "../../../users-roles/domain/models/user-role.model";
import { UserClaim } from "./user-claim.model";
import { Exclude } from "class-transformer";
import { Site } from "../../../../settings/sites/domain/models/site.model";

@Entity()
export class User extends BaseModel<number> {
    @Column({ unique: true })
    email: string;

    @Column({ unique: true })
    userName: string;

    @Column()
    @Exclude()
    passwordHash: string;

    @Column({ default: false })
    emailConfirmed: boolean;

    @Column({ nullable: true })
    @Exclude()
    securityStamp: string;

    @Column({ nullable: true })
    phoneNumber: string;

    @Column({ default: false })
    phoneNumberConfirmed: boolean;

    @Column({ default: false })
    twoFactorEnabled: boolean;

    @Column({ type: 'timestamp', nullable: true })
    lockoutEnd: Date;

    @Column({ default: true })
    lockoutEnabled: boolean;

    @Column({ default: 0 })
    accessFailedCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    status: number;

    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles: UserRole[];

    @OneToMany(() => UserClaim, userClaim => userClaim.user)
    userClaims: UserClaim[];

    @ManyToOne(() => Site, site => site.users)
    site: Site;
}