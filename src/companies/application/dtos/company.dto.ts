import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class CompanyDto extends BaseModelDto<number> {
    name: string;
    shortName: string;
    contactPerson: string;
    phoneNumber: string;
    address: string;
    commercialRegistration: string;
}