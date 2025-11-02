import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from 'src/shared/infrastructure/data/repositories/base.repository';
import { RefreshToken } from 'src/users/domain/models/refresh-token.model';
import { BaseSpecification } from 'src/shared/infrastructure/data/specifications/base-specification';

@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshToken, number> {
    constructor(dataSource: DataSource) {
        super(dataSource, RefreshToken);
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        const spec = new BaseSpecification();

        spec.addCriteria(`token = '${token}' AND isRevoked = false`);

        const tokens = await this.getAllAsync(spec);

        return tokens && tokens.length > 0 ? tokens[0] : null;
    }

    async findActiveTokensByUserId(userId: number): Promise<RefreshToken[]> {
        const spec = new BaseSpecification();

        spec.addCriteria(`userId = ${userId} AND isRevoked = false`);
        spec.addOrderByDescending('createdAt');

        return await this.getAllAsync(spec);
    }

    async revokeAllUserTokens(userId: number): Promise<void> {
        const spec = new BaseSpecification();

        spec.addCriteria(`userId = ${userId} AND isRevoked = false`);

        const tokens = await this.getAllAsync(spec);

        for (const token of tokens) {
            token.isRevoked = true;
        }

        if (tokens.length > 0) {
            await this.updateRangeAsync(tokens);
        }
    }

    async deleteExpiredTokens(): Promise<number> {
        const now = new Date();
        const spec = new BaseSpecification();

        spec.addCriteria(`expiresAt < '${now.toISOString()}'`);

        const expiredTokens = await this.getAllAsync(spec);

        if (expiredTokens.length > 0) {
            await this.deleteRangeAsync(expiredTokens);
        }

        return expiredTokens.length;
    }

    async deleteRevokedTokensOlderThan(days: number): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        const spec = new BaseSpecification();

        spec.addCriteria(`isRevoked = true AND createdAt < '${cutoffDate.toISOString()}'`);

        const oldRevokedTokens = await this.getAllAsync(spec);

        if (oldRevokedTokens.length > 0) {
            await this.deleteRangeAsync(oldRevokedTokens);
        }

        return oldRevokedTokens.length;
    }

    async countActiveTokensByUserId(userId: number): Promise<number> {
        const spec = new BaseSpecification();

        spec.addCriteria(`userId = ${userId} AND isRevoked = false`);

        const tokens = await this.getAllAsync(spec);

        return tokens.length;
    }

    async findByTokenWithUser(token: string): Promise<RefreshToken | null> {
        const spec = new BaseSpecification();

        spec.addCriteria(`token = '${token}'`);
        spec.addInclude('user');

        const tokens = await this.getAllAsync(spec);

        return tokens && tokens.length > 0 ? tokens[0] : null;
    }
}