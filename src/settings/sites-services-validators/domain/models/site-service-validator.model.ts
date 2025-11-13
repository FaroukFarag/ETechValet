import { SiteService } from "../../../../settings/sites-services/domain/models/site-service.model";
import { Validator } from "../../../../settings/validators/domain/models/validator.model";
import { Entity, ManyToOne, PrimaryColumn } from "typeorm";

@Entity()
export class SiteServiceValidator {
    @PrimaryColumn()
    siteId: number;

    @PrimaryColumn()
    serviceId: number;

    @PrimaryColumn()
    validatorId: number;

    @ManyToOne(() => SiteService, siteService => siteService.siteServiceValidators)
    siteService: SiteService;

    @ManyToOne(() => Validator, validator => validator.validatorSiteServices)
    validator: Validator;
}