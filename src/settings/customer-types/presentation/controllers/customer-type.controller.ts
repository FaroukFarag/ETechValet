import { Controller } from "@nestjs/common";
import { BaseController } from "src/shared/presentation/controllers/base.controller";
import { CustomerTypeService } from "../../application/services/customer-type.service";
import { CustomerTypeDto } from "../../application/dtos/customer-type.dto";
import { CustomerType } from "../../domain/models/customer-type.model";

@Controller('api/customer-types')
export class CustomerTypeController extends BaseController<
    CustomerTypeService,
    CustomerTypeDto,
    CustomerTypeDto,
    CustomerTypeDto,
    CustomerTypeDto,
    CustomerType,
    number> {
    constructor(private readonly customerTypeService: CustomerTypeService) {
        super(customerTypeService);
    }
}