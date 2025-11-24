export class SalesReportDto {
    siteName: string;
    requestNo: string;
    startTime: Date;
    plateNumber: string;
    gateName: string;
    customerMobileNumber?: string | undefined;
    receivedByName: string;
    parkedByName: string;
    deliveredByName: string;
    amount: number;
    paymentTypeName: string;
}