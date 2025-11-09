import { Gate } from "../../../../settings/gates/domain/models/gate.model";
import { User } from "../../../../settings/users/domain/models/user.model";
import { Entity, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class UserGate {
    @PrimaryColumn()
    userId: number;

    @PrimaryColumn()
    gateId: number;

    @ManyToOne(() => User, user => user.userGates)
    user: User

    @ManyToOne(() => Gate, gate => gate.gateUsers)
    gate: Gate
}