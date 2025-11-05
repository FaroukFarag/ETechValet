import { BaseModelDto } from "src/shared/application/dtos/base-model.dto";

export class SiteDto extends BaseModelDto<number> {
        partnerId: number;

        siteId: string;

        name: string;

        gatesNumber: number;

        city: string;

        address: string;

        status: string;
}