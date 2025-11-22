import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { UserRole } from "../../../users-roles/domain/models/user-role.model";
import { UserClaim } from "./user-claim.model";
import { Exclude } from "class-transformer";
import { Site } from "../../../../settings/sites/domain/models/site.model";
import { PickupRequest } from "../../../../requests/domain/models/pickup-request.model";
import { RecallRequest } from "../../../../requests/domain/models/recall-request.model";
import { UserGate } from "../../../../settings/users-gates/domain/models/user-gate.model";
import { ResetPasswordToken } from "./reset-password-token.model";
import { UserStatus } from "../enums/user-status.enum";
import { Shift } from "../../../../shifts/domain/models/shift.model";

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

    @Column({ nullable: true })
    workingHours: number;

    @Column({ nullable: true, type: "enum", enum: UserStatus })
    status: UserStatus;

    @Column({ nullable: true })
    siteId: number;

    @ManyToOne(() => Site, site => site.users)
    site: Site;

    @OneToMany(() => UserRole, userRole => userRole.user)
    userRoles: UserRole[];

    @OneToMany(() => UserClaim, userClaim => userClaim.user)
    userClaims: UserClaim[];

    @OneToMany(() => PickupRequest, pickupRequest => pickupRequest.receivedBy)
    receivedRequests: PickupRequest[];

    @OneToMany(() => PickupRequest, pickupRequest => pickupRequest.parkedBy)
    parkedRequests: PickupRequest[];

    @OneToMany(() => RecallRequest, recallRequest => recallRequest.deliveredBy)
    deliveredRequests: RecallRequest[];

    @OneToMany(() => UserGate, userGate => userGate.user)
    userGates: UserGate[];

    @OneToMany(() => Shift, shift => shift.user)
    shifts: Shift[];

    @OneToMany(() => ResetPasswordToken, resetPasswordToken => resetPasswordToken.user)
    resetPasswordTokens: ResetPasswordToken[];
}