import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class BaseRequestDto extends BaseModelDto<number> {
    plateType: number;
    plateNumber: string;
    cardNumber: number;
    customerMobileNumber: number;
    gateId: number;
}