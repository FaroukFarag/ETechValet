import { Injectable } from "@nestjs/common";
import { PickupRequest } from "src/requests/domain/models/pickup-request.model";
import { CustomerType } from "src/settings/customer-types/domain/models/customer-type.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";

@Injectable()
export class PickupRequestRepository extends BaseRepository<PickupRequest, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, PickupRequest);
    }

    async getTopCustomerType(
        startTime?: Date,
        endTime?: Date
    ): Promise<{ customerType: CustomerType; requestCount: number } | null> {
        let queryBuilder = this.repository
            .createQueryBuilder('pickupRequest')
            .select('pickupRequest.customerType', 'customerType')
            .addSelect('COUNT(pickupRequest.id)', 'requestCount')
            .groupBy('pickupRequest.customerType');

        if (startTime && endTime) {
            queryBuilder = queryBuilder.andWhere(
                'pickupRequest.startTime BETWEEN :startTime AND :endTime',
                { startTime, endTime }
            );
        }

        else if (startTime) {
            queryBuilder = queryBuilder.andWhere(
                'pickupRequest.startTime >= :startTime',
                { startTime }
            );
        }

        else if (endTime) {
            queryBuilder = queryBuilder.andWhere(
                'pickupRequest.startTime <= :endTime',
                { endTime }
            );
        }

        const result = await queryBuilder
            .orderBy('"requestCount"', 'DESC')
            .limit(1)
            .getRawOne();

        if (!result) {
            return null;
        }

        return {
            customerType: result.customerType as CustomerType,
            requestCount: parseInt(result.requestCount, 10)
        };
    }

    async getAverageParkingHours(startTime?: Date, endTime?: Date): Promise<number> {
        const query = this.repository.createQueryBuilder('pr');

        if (startTime && endTime) {
            query.andWhere('pr.startTime BETWEEN :startTime AND :endTime', { startTime, endTime });
        }

        else if (startTime) {
            query.andWhere('pr.startTime >= :startTime', { startTime });
        }

        else if (endTime) {
            query.andWhere('pr.startTime <= :endTime', { endTime });
        }

        query.select(
            `AVG(EXTRACT(EPOCH FROM (pr.endTime - pr.startTime)) / 3600)`,
            'avgHours'
        );

        const result = await query.getRawOne();

        return Number(result?.avgHours ?? 0);
    }

}