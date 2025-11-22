import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CustomerType } from "./domain/models/customer-type.model";
import { CustomerTypeRepository } from "./infrastructure/data/repositories/customer-type.repository";
import { CustomerTypeService } from "./application/services/customer-type.service";
import { CustomerTypeController } from "./presentation/controllers/customer-type.controller";

@Module({
    imports: [TypeOrmModule.forFeature([CustomerType])],
    providers: [CustomerTypeRepository, CustomerTypeService],
    controllers: [CustomerTypeController]
})
export class CustomerTypesModule { }