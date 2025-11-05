import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne } from "typeorm";
import { User } from "../../../users/domain/models/user.model";
import { Role } from "../../../roles/domain/models/role.model";

@Entity()
export class UserRole extends BaseModel<number> {
    @Column()
    userId: number;

    @Column()
    roleId: number;

    @ManyToOne(() => User, user => user.userRoles)
    user: User;

    @ManyToOne(() => Role, role => role.userRoles)
    role: Role;
}
