import { BaseModel } from "../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne } from "typeorm";
import { Role } from "./role.model";

@Entity()
export class RoleClaim extends BaseModel<number> {
    @Column()
    roleId: string;

    @Column()
    claimType: string;

    @Column()
    claimValue: string;

    @ManyToOne(() => Role, role => role.roleClaims)
    role: Role;
}