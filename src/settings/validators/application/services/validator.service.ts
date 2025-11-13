import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { Validator } from "../../domain/models/validator.model";
import { ValidatorDto } from "../dtos/validator.dto";
import { ValidatorRepository } from "../../infrastructure/data/validator.repository";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { SiteServiceValidatorRepository } from "src/settings/sites-services-validators/infrastructure/data/repositories/site-service-validator.repository";
import { SiteServiceValidator } from "src/settings/sites-services-validators/domain/models/site-service-validator.model";

@Injectable()
export class ValidatorService extends BaseService<
    ValidatorDto,
    ValidatorDto,
    ValidatorDto,
    ValidatorDto,
    Validator,
    number> {
    constructor(private readonly validatorRepository: ValidatorRepository,
        private readonly siteServiceValidatorRepository: SiteServiceValidatorRepository
    ) {
        super(validatorRepository);
    }

    override async create(validatorDto: ValidatorDto, entityClass: new () => Validator, dtoClass: new () => ValidatorDto): Promise<ResultDto<ValidatorDto>> {
        return this.executeServiceCall(
            'Create Validator',
            async () => {
                const validator = await this.validatorRepository
                    .createAsync(this.map(validatorDto, entityClass));

                if (validatorDto.validatorSiteServices &&
                    validatorDto.validatorSiteServices.length != 0) {
                    const validatorSiteServices = validatorDto.validatorSiteServices.map(
                        validatorSiteServiceDto => {
                            const validatorSiteService = new SiteServiceValidator();

                            validatorSiteService.siteId = validatorSiteServiceDto.id.siteId;
                            validatorSiteService.serviceId = validatorSiteServiceDto.id.serviceId;
                            validatorSiteService.validatorId = validator.id;

                            return validatorSiteService;
                        }
                    );

                    validator.validatorSiteServices = await this
                        .siteServiceValidatorRepository
                        .updateRangeAsync(validatorSiteServices);
                }

                return this.map(validator, dtoClass);
            }
        )
    }

    override async update(validatorDto: ValidatorDto, entityClass: new () => Validator): Promise<ResultDto<ValidatorDto>> {
        return this.executeServiceCall(
            'Update Validator',
            async () => {
                const validator = await this.validatorRepository
                    .updateAsync(this.map(validatorDto, entityClass));

                if (validatorDto.validatorSiteServices &&
                    validatorDto.validatorSiteServices.length != 0) {
                    const validatorSiteServices = validatorDto.validatorSiteServices.map(
                        validatorSiteServiceDto => {
                            const validatorSiteService = new SiteServiceValidator();

                            validatorSiteService.siteId = validatorSiteServiceDto.id.siteId;
                            validatorSiteService.serviceId = validatorSiteServiceDto.id.serviceId;
                            validatorSiteService.validatorId = validator.id;

                            return validatorSiteService;
                        }
                    );

                    validator.validatorSiteServices = await this
                        .siteServiceValidatorRepository
                        .updateRangeAsync(validatorSiteServices);
                }

                return this.map(validator, ValidatorDto);
            }
        )
    }
}