export class PickupRequestReceiptDto {
    plateNumber: string;
    startTime: Date;
    endTime: Date;
    extraServices: boolean;
    valet: number;
    fee: number;
}