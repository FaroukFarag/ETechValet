import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { ServiceDto } from "../dtos/service.dto";
import { Service } from "../../../services/domain/models/service.model";
import { ServiceRepository } from "../../infrastructure/data/repositories/service.repository";

@Injectable()
export class ServiceService extends BaseService<
    ServiceDto,
    ServiceDto,
    ServiceDto,
    ServiceDto,
    Service,
    number> {
    constructor(private readonly serviceRepository: ServiceRepository) {
        super(serviceRepository);
    }
}
