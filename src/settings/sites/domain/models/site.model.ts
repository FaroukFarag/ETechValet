import { Company } from "../../../../settings/companies/domain/models/company.model";
import { Gate } from "../../../gates/domain/models/gate.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { User } from "../../../../settings/users/domain/models/user.model";
import { NotificationsTemplate } from "../../../../settings/notifications-templates/domain/models/notifications-template.model";
import { Request } from "../../../../requests/domain/models/request.model";
import { Card } from "../../../../settings/cards/domain/models/card.model";
import { Service } from "src/settings/services/domain/models/service.model";

@Entity()
export class Site extends BaseModel<number> {
    @Column()
    name: string;

    @Column()
    companyId: number;

    @Column()
    valueType: number;

    @Column()
    fixedValue: number;

    @Column()
    percentage: string;

    @Column()
    address: string;

    @Column()
    status: number;

    @ManyToOne(() => Company, company => company.sites)
    company: Company;

    @OneToMany(() => User, user => user.site)
    users: User[];

    @OneToMany(() => Gate, gate => gate.site)
    notificationsTemplates: NotificationsTemplate[];

    @OneToMany(() => Gate, gate => gate.site)
    gates: Gate[];

    @OneToMany(() => Card, card => card.site)
    cards: Card[];

    @OneToMany(() => Request, request => request.site)
    requests: Request[];
}