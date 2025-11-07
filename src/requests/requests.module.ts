import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Request } from "./domain/models/request.model";

@Module({
    imports: [TypeOrmModule.forFeature([Request])],
    providers: [],
    controllers: []
})
export class RequestsModule { }