import { Site } from "../../../sites/domain/models/site.model";
import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class NotificationsTemplate extends BaseModel<number> {
    @Column()
    siteId: number;

    @Column()
    channel: number;

    @Column()
    messageType: string;

    @Column()
    messageTemplate: string;

    @Column()
    status: string;

    @ManyToOne(() => Site, site => site.notificationsTemplates)
    site: Site;
}