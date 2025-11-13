import { Controller } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { ValidatorService } from "../../application/services/validator.service";
import { ValidatorDto } from "../../application/dtos/validator.dto";
import { Validator } from "../../domain/models/validator.model";

@Controller('api/validators')
export class ValidatorController extends BaseController<
    ValidatorService,
    ValidatorDto,
    ValidatorDto,
    ValidatorDto,
    ValidatorDto,
    Validator,
    number> {
    constructor(private readonly validatorService: ValidatorService) {
        super(validatorService);
    }
}