import { BaseModel } from '../../../shared/domain/models/base-model';
import { Entity, Column, OneToMany } from 'typeorm';
import { RoleClaim } from './role-claim.model';
import { UserRole } from '../../../users-roles/domain/models/user-role.model';

@Entity()
export class Role extends BaseModel<number> {
    @Column({ unique: true })
    name: string;

    @Column()
    normalizedName: string;

    @OneToMany(() => UserRole, userRole => userRole.role)
    userRoles: UserRole[];

    @OneToMany(() => RoleClaim, roleClaim => roleClaim.role)
    roleClaims: RoleClaim[];
}
