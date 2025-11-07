import { BaseModel } from "../../../../shared/domain/models/base-model";
import { Site } from "../../../sites/domain/models/site.model";
import { Column, Entity, ManyToOne } from "typeorm";

@Entity()
export class Card extends BaseModel<number> {
    @Column()
    type: number;

    @Column()
    number: number;

    @Column()
    siteId: number;

    @Column()
    status: number;

    @ManyToOne(() => Site, site => site.cards)
    site: Site;
}