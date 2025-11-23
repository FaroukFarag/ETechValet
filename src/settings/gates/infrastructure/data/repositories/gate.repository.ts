import { Injectable } from "@nestjs/common";
import { Gate } from "src/settings/gates/domain/models/gate.model";
import { BaseRepository } from "src/shared/infrastructure/data/repositories/base.repository";
import { DataSource } from "typeorm";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";

@Injectable()
export class GateRepository extends BaseRepository<Gate, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, Gate);
    }

    async getActiveGate(startTime?: Date, endTime?: Date): Promise<Gate | null> {
        const queryBuilder = this.repository
            .createQueryBuilder('gate')
            .leftJoin('gate.pickupRequests', 'pickupRequest')
            .select('gate.id')
            .addSelect('COUNT(pickupRequest.id)', 'pickupCount')
            .groupBy('gate.id');

        if (startTime && endTime) {
            queryBuilder.andWhere(
                'pickupRequest.startTime BETWEEN :startTime AND :endTime',
                { startTime, endTime }
            );
        }

        else if (startTime) {
            queryBuilder.andWhere('pickupRequest.startTime >= :startTime', { startTime });
        }

        else if (endTime) {
            queryBuilder.andWhere('pickupRequest.startTime <= :endTime', { endTime });
        }

        queryBuilder
            .orderBy('"pickupCount"', 'DESC')
            .limit(1);

        const result = await queryBuilder.getRawOne();

        if (!result) {
            return null;
        }

        return await this.getAsync(result.gate_id);
    }
}