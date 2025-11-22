import { Injectable } from "@nestjs/common";
import { BaseService } from "src/shared/application/services/base.service";
import { CustomerTypeDto } from "../dtos/customer-type.dto";
import { CustomerType } from "../../domain/models/customer-type.model";
import { CustomerTypeRepository } from "../../infrastructure/data/repositories/customer-type.repository";

@Injectable()
export class CustomerTypeService extends BaseService<
    CustomerTypeDto,
    CustomerTypeDto,
    CustomerTypeDto,
    CustomerTypeDto,
    CustomerType,
    number> {
    constructor(private readonly customerTypeRepository: CustomerTypeRepository) {
        super(customerTypeRepository);
    }
}