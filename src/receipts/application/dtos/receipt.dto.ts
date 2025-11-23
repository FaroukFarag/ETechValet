import { PickupRequestDto } from "src/requests/application/dtos/pickup-request.dto";
import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class ReceiptDto extends BaseModelDto<number> {
    plateNumber: string;
    startTime: Date;
    endTime: Date;
    extraServices: number;
    valet: number;
    parking: number;
    tax: number;
    requestId: number;
    request: PickupRequestDto;
}