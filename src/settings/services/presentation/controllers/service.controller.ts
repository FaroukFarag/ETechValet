import { Controller } from "@nestjs/common";
import { ServiceDto } from "src/settings/services/application/dtos/service.dto";
import { ServiceService } from "src/settings/services/application/services/service.service";
import { Service } from "src/settings/services/domain/models/service.model";
import { BaseController } from "src/shared/presentation/controllers/base.controller";

@Controller('api/services')
export class ServiceController extends BaseController<
    ServiceService,
    ServiceDto,
    ServiceDto,
    ServiceDto,
    ServiceDto,
    Service,
    number> {
    constructor(private readonly serviceService: ServiceService) {
        super(serviceService);
    }
}