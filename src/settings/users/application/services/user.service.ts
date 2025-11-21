import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BaseService } from "src/shared/application/services/base.service";
import { UserDto } from "../dtos/user.dto";
import { User } from "src/settings/users/domain/models/user.model";
import { UserRepository } from "src/settings/users/infrastructure/data/repositories/user.repository";
import { BaseSpecification } from "src/shared/infrastructure/data/specifications/base-specification";
import { ResultDto } from "src/shared/application/dtos/result.dto";
import { v4 as uuidv4 } from 'uuid';
import { ChangePasswordDto } from "../dtos/change-password.dto";
import { UserRoleRepository } from "src/settings/users-roles/infrastructure/data/repositories/user-role.repository";
import { RoleRepository } from "src/settings/roles/infrastructure/data/repositories/role.repository";
import { RefreshToken } from "src/settings/users/domain/models/refresh-token.model";
import { UserRole } from "src/settings/users-roles/domain/models/user-role.model";
import { RefreshTokenRepository } from "src/settings/users/infrastructure/data/repositories/refresh-token.repository";
import { LoginDto } from "../dtos/login.dto";
import { CreateUserDto } from "../dtos/create-user.dto";
import { UserGate } from "src/settings/users-gates/domain/models/user-gate.model";
import { UserGateRepository } from "src/settings/users-gates/infrastructure/data/repositories/user-gate.repository";
import { UserGateDto } from "src/settings/users-gates/application/dtos/user-gate.dto";
import { ResetPasswordTokenRepository } from "../../infrastructure/data/repositories/reset-password-token.repository";
import { ResetPasswordToken } from "../../domain/models/reset-password-token.model";
import { ResetPasswordDto } from "../dtos/reset-password.dto";
import { EmailService } from "src/shared/infrastructure/email/email.service";

@Injectable()
export class UserService extends BaseService<
    CreateUserDto,
    UserDto,
    UserDto,
    UserDto,
    User,
    number> {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly roleRepository: RoleRepository,
        private readonly userRoleRepository: UserRoleRepository,
        private readonly refreshTokenRepository: RefreshTokenRepository,
        private readonly resetPasswordTokenRepository: ResetPasswordTokenRepository,
        private readonly userGateRepository: UserGateRepository,
        private readonly emailService: EmailService,
        private readonly jwtService: JwtService
    ) {
        super(userRepository);
    }

    override async create(userDto: CreateUserDto): Promise<ResultDto<CreateUserDto>> {
        return this.executeServiceCall(
            `Create User`,
            async () => {
                const emailSpec = new BaseSpecification();

                emailSpec.addCriteria(`email = '${userDto.email}'`);

                const usersByEmail = await this.userRepository.getAllAsync(emailSpec);
                const usernameSpec = new BaseSpecification();

                usernameSpec.addCriteria(`user.userName = '${userDto.userName}'`);

                const usersByUsername = await this.userRepository.getAllAsync(usernameSpec);

                if (usersByEmail.length > 0 || usersByUsername.length > 0) {
                    throw new ConflictException('User already exists');
                }

                const user = this.map(userDto, User);

                user.passwordHash = await bcrypt.hash(userDto.password, 10);
                user.securityStamp = uuidv4();

                await this.userRepository.createAsync(user);

                for (const role of userDto.roles)
                    await this.addToRole(user.id, role.name);

                return this.map(userDto, CreateUserDto);
            },
        );
    }

    override async createRange(createEntitiesDtos: CreateUserDto[]): Promise<ResultDto<boolean>> {
        return this.executeServiceCall(
            `Create multiple Users`,
            async () => {
                const entities = this.mapArray(createEntitiesDtos, User);

                for (let i = 0; i < entities.length; i++) {
                    const dto = createEntitiesDtos[i];
                    entities[i].passwordHash = await bcrypt.hash(dto.password, 10);
                    entities[i].securityStamp = uuidv4();
                }

                const createdEntities = await this.userRepository.createRangeAsync(entities);

                return createdEntities.length === entities.length;
            },
        );
    }

    async getByUsername(username: string): Promise<ResultDto<UserDto>> {
        return this.executeServiceCall(
            'Get User by Username',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`userName = '${username}'`);
                spec.addInclude('userRoles');
                spec.addInclude('userRoles.role');

                const users = await this.userRepository.getAllAsync(spec);

                if (!users || users.length === 0) {
                    throw new NotFoundException('User not found');
                }

                return this.map(users[0], UserDto);
            }
        );
    }

    async getByEmail(email: string): Promise<ResultDto<UserDto>> {
        return this.executeServiceCall(
            'Get User by Email',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`email = '${email}'`);

                const users = await this.userRepository.getAllAsync(spec);

                if (!users || users.length === 0) {
                    throw new NotFoundException('User not found');
                }

                return this.map(users[0], UserDto);
            }
        );
    }

    async getTeamMembers(): Promise<ResultDto<UserDto[]>> {
        return this.executeServiceCall(
            'Get Team Members',
            async () => {
                const spec = new BaseSpecification();
                const columns = [
                    "id", "userName", "site.name as siteName",
                    "phoneNumber", "status"
                ];

                spec.addCriteria(`"siteId" IS NOT NULL`);

                const users = await this.userRepository.getAllProjectedAsync(columns, spec);

                return this.mapArray(users, UserDto);
            }
        );
    }

    async updateMemberData(userDto: UserDto): Promise<ResultDto<UserDto>> {
        return this.executeServiceCall(
            `Create User`,
            async () => {
                const usernameSpec = new BaseSpecification();

                usernameSpec.addCriteria(`"userName" = '${userDto.userName}'`);

                const usersByUsername = await this.userRepository.getAllAsync(usernameSpec);

                if (usersByUsername.length == 0) {
                    throw new NotFoundException('User Not Found');
                }

                const user = usersByUsername[0];

                user.siteId = userDto.siteId;
                user.phoneNumber = userDto.phoneNumber;
                user.workingHours = userDto.workingHours;

                await this.userRepository.updateAsync(user);

                if (userDto.userGates && userDto.userGates.length > 0) {
                    let userGates = userDto.userGates.map(userGateDto => {
                        const userGate = new UserGate()

                        userGate.userId = user.id;
                        userGate.gateId = userGateDto.id.gateId;

                        return userGate;
                    });

                    userGates = await this.userGateRepository.updateRangeAsync(userGates);

                    userDto.userGates = this.mapArray(userGates, UserGateDto);
                }

                return this.map(user, UserDto);
            },
        );
    }

    override async update(userDto: UserDto): Promise<ResultDto<UserDto>> {
        return this.executeServiceCall(
            `Update User`,
            async () => {
                const user = await this.userRepository.getAsync(userDto.id);

                if (!user) throw new NotFoundException("User not found");

                const emailSpec = new BaseSpecification();

                emailSpec.addCriteria(`email = '${userDto.email}' AND id != ${userDto.id}`);

                const usernameSpec = new BaseSpecification();

                usernameSpec.addCriteria(`userName = '${userDto.userName}' AND id != ${userDto.id}`);

                const emailExists = await this.userRepository.getAllAsync(emailSpec);
                const usernameExists = await this.userRepository.getAllAsync(usernameSpec);

                if (emailExists.length > 0 || usernameExists.length > 0)
                    throw new ConflictException("User already exists");

                this.mapToExisting(userDto, user);

                const userGateSpec = new BaseSpecification();

                userGateSpec.addCriteria(`userId = '${userDto.id}`);

                const currentGates = await this.userGateRepository.getAllAsync(userGateSpec);
                const newGateIds = userDto.userGates?.map(g => g.id.gateId) ?? [];
                const currentGateIds = currentGates.map(g => g.gateId);
                const gatesToAdd = newGateIds.filter(g => !currentGateIds.includes(g));
                const gatesToRemove = currentGateIds.filter(g => !newGateIds.includes(g));

                if (gatesToAdd.length > 0) {
                    const addEntities = gatesToAdd.map(g => {
                        const userGate = new UserGate();
                        userGate.userId = userDto.id;
                        userGate.gateId = g;
                        return userGate;
                    });

                    await this.userGateRepository.createRangeAsync(addEntities);
                }

                if (gatesToRemove.length > 0) {
                    await this.userGateRepository
                        .deleteRangeAsync(gatesToRemove.map(g => {
                            const userGate = new UserGate();

                            userGate.gateId = g;
                            userGate.userId = userDto.id;

                            return userGate
                        }));
                }

                const userRoleSpec = new BaseSpecification();

                userRoleSpec.addCriteria(`userId = '${userDto.id}`);
                userRoleSpec.addInclude('role');

                const currentRoles = await this.userRoleRepository.getAllAsync(userRoleSpec);
                const newRoles = userDto.roles?.map(r => r.name) ?? [];

                const currentRoleNames = currentRoles.map(ur => ur.role.name);
                const rolesToAdd = newRoles.filter(r => !currentRoleNames.includes(r));
                const rolesToRemove = currentRoleNames.filter(r => !newRoles.includes(r));

                for (const role of rolesToAdd) {
                    await this.addToRole(userDto.id, role);
                }

                for (const role of rolesToRemove) {
                    await this.removeFromRole(userDto.id, role);
                }

                await this.userRepository.updateAsync(user);

                return this.map(userDto, UserDto);
            }
        );
    }

    async validatePassword(user: User, password: string): Promise<boolean> {
        return await bcrypt.compare(password, user.passwordHash);
    }

    async changePassword(changePasswordDto: ChangePasswordDto): Promise<ResultDto<UserDto>> {
        return this.executeServiceCall(
            'Change User Password',
            async () => {
                const user = await this.userRepository.getAsync(changePasswordDto.userId);

                if (!user) {
                    throw new NotFoundException('User not found');
                }

                const isValid = await this.validatePassword(user, changePasswordDto.currentPassword);

                if (!isValid) {
                    throw new UnauthorizedException('Current password is incorrect');
                }

                user.passwordHash = await bcrypt.hash(changePasswordDto.newPassword, 10);
                user.securityStamp = uuidv4();

                const updatedUser = await this.userRepository.updateAsync(user);

                return this.map(updatedUser, UserDto);
            }
        );
    }

    async forgotPassword(email: string): Promise<ResultDto<{ message: string }>> {
        return this.executeServiceCall(
            'Forgot Password',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`email = '${email}'`);

                const users = await this.userRepository.getAllAsync(spec);

                if (!users || users.length === 0) {
                    return { message: 'A reset link has been sent to your email.' };
                }

                const user = users[0];
                const token = uuidv4();
                const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
                const resetToken = new ResetPasswordToken();

                resetToken.userId = user.id;
                resetToken.token = token;
                resetToken.expiresAt = expiresAt;
                resetToken.isUsed = false;

                await this.resetPasswordTokenRepository.createAsync(resetToken);

                const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

                const html = `
                    <h2>Password Reset</h2>
                    <p>Hello ${user.userName},</p>
                    <p>Click the link below to reset your password:</p>
                    <a href="${resetLink}">${resetLink}</a>
                    <p>This link expires in 1 hour.</p>
                `;

                await this.emailService.sendEmail(user.email, "Password Reset", html);

                return { message: 'A reset link has been sent to your email.' };
            }
        );
    }

    async resetPassword(resetDto: ResetPasswordDto): Promise<ResultDto<{ message: string }>> {
        return this.executeServiceCall(
            'Reset Password',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`token = '${resetDto.token}'`);

                const resetTokens = await this.resetPasswordTokenRepository.getAllAsync(spec);

                if (!resetTokens || resetTokens.length === 0) {
                    throw new UnauthorizedException('Invalid reset token');
                }

                const resetToken = resetTokens[0];

                if (resetToken.isUsed) {
                    throw new UnauthorizedException('Reset token already used');
                }

                if (new Date(resetToken.expiresAt) < new Date()) {
                    throw new UnauthorizedException('Reset token expired');
                }

                const user = await this.userRepository.getAsync(resetToken.userId);

                if (!user) {
                    throw new NotFoundException('User not found');
                }

                user.passwordHash = await bcrypt.hash(resetDto.newPassword, 10);
                user.securityStamp = uuidv4();

                await this.userRepository.updateAsync(user);

                resetToken.isUsed = true;

                await this.resetPasswordTokenRepository.updateAsync(resetToken);

                return { message: 'Password has been reset successfully.' };
            }
        );
    }

    async addToRole(userId: number, roleName: string): Promise<ResultDto<void>> {
        return this.executeServiceCall(
            'Add User To Role',
            async () => {
                const roleSpec = new BaseSpecification();

                roleSpec.addCriteria(`name = '${roleName}'`);

                const roles = await this.roleRepository.getAllAsync(roleSpec);

                if (!roles || roles.length === 0) {
                    throw new NotFoundException('Role not found');
                }

                const role = roles[0];

                const userRoleSpec = new BaseSpecification();

                userRoleSpec.addCriteria(`user_role.userId = ${userId} AND user_role.roleId = ${role.id}`);

                const existingUserRoles = await this.userRoleRepository.getAllAsync(userRoleSpec);

                if (existingUserRoles && existingUserRoles.length > 0) {
                    return;
                }

                const userRole = new UserRole();

                userRole.userId = userId;
                userRole.roleId = role.id;

                await this.userRoleRepository.createAsync(userRole);
            }
        );
    }

    async removeFromRole(userId: number, roleName: string): Promise<ResultDto<void>> {
        return this.executeServiceCall(
            'Remove User From Role',
            async () => {
                const roleSpec = new BaseSpecification();

                roleSpec.addCriteria(`name = '${roleName}'`);

                const roles = await this.roleRepository.getAllAsync(roleSpec);

                if (!roles || roles.length === 0) {
                    throw new NotFoundException('Role not found');
                }

                const role = roles[0];

                const userRoleSpec = new BaseSpecification();

                userRoleSpec.addCriteria(`userId = ${userId} AND roleId = ${role.id}`);

                const userRoles = await this.userRoleRepository.getAllAsync(userRoleSpec);

                if (userRoles && userRoles.length > 0) {
                    await this.userRoleRepository.deleteAsync(userRoles[0].id);
                }
            }
        );
    }

    async getUserRoles(userId: number): Promise<ResultDto<string[]>> {
        return this.executeServiceCall(
            'Get User Roles',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`id = ${userId}`);
                spec.addInclude('userRoles');
                spec.addInclude('userRoles.role');

                const users = await this.userRepository.getAllAsync(spec);

                if (!users || users.length === 0) {
                    return [];
                }

                const user = users[0];

                return user?.userRoles?.map(ur => ur.role.name) || [];
            }
        );
    }

    async isInRole(userId: number, roleName: string): Promise<ResultDto<boolean>> {
        return this.executeServiceCall(
            'Is User In Role',
            async () => {
                const rolesResult = await this.getUserRoles(userId);

                if (!rolesResult.isSuccess) {
                    return false;
                }

                return rolesResult.data?.includes(roleName) || false;
            }
        );
    }

    async updateSecurityStamp(userId: number): Promise<ResultDto<void>> {
        return this.executeServiceCall(
            'Update Security Stamp',
            async () => {
                const user = await this.userRepository.getAsync(userId);

                if (!user) {
                    throw new NotFoundException('User not found');
                }

                user.securityStamp = uuidv4();

                await this.userRepository.updateAsync(user);
            }
        );
    }

    async isLockedOut(user: User): Promise<boolean> {
        if (!user.lockoutEnabled) {
            return false;
        }

        if (user.lockoutEnd && new Date(user.lockoutEnd) > new Date()) {
            return true;
        }

        return false;
    }

    async accessFailed(user: User): Promise<ResultDto<void>> {
        return this.executeServiceCall(
            'User Access Failed',
            async () => {
                user.accessFailedCount += 1;

                if (user.accessFailedCount >= 5) {
                    user.lockoutEnd = new Date(Date.now() + 15 * 60 * 1000);
                }

                await this.userRepository.updateAsync(user);
            }
        );
    }

    async resetAccessFailedCount(userId: number): Promise<ResultDto<void>> {
        return this.executeServiceCall(
            'Reset User Access Failed Count',
            async () => {
                const user = await this.userRepository.getAsync(userId);

                if (!user) {
                    throw new NotFoundException('User not found');
                }

                user.accessFailedCount = 0;
                user.lockoutEnd = null!;

                await this.userRepository.updateAsync(user);
            }
        );
    }

    async login(loginDto: LoginDto): Promise<ResultDto<{ accessToken: string; refreshToken: string; expiresIn: number }>> {
        return this.executeServiceCall(
            'Login',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`user.userName = '${loginDto.userName}'`);

                spec.addInclude('site');
                spec.addInclude('userGates');
                spec.addInclude('userGates.gate');
                spec.addInclude('userRoles');
                spec.addInclude('userRoles.role');

                const users = await this.userRepository.getAllAsync(spec);

                if (!users || users.length === 0) {
                    throw new UnauthorizedException('Invalid credentials');
                }

                const user = users[0];

                if (await this.isLockedOut(user)) {
                    throw new UnauthorizedException('Account is locked');
                }

                const isPasswordValid = await this.validatePassword(user, loginDto.password);

                if (!isPasswordValid) {
                    await this.accessFailed(user);

                    throw new UnauthorizedException('Invalid credentials');
                }

                await this.resetAccessFailedCount(user.id);

                const roles = user.userRoles?.map(ur => ur.role.name) || [];
                const payload = {
                    username: user.userName,
                    id: user.id,
                    email: user.email,
                    roles,
                    gates: user.userGates.map(userGate => {
                        return {
                            gateId: userGate.gateId,
                            gateName: userGate.gate.name
                        };
                    })
                };

                const accessToken = this.jwtService.sign(payload);
                const refreshToken = await this.createRefreshToken(user.id);

                return {
                    accessToken,
                    refreshToken,
                    expiresIn: 900
                };
            }
        );
    }

    async createRefreshToken(userId: number): Promise<string> {
        const token = uuidv4();
        const expiresAt = new Date();

        expiresAt.setDate(expiresAt.getDate() + 7);

        const refreshToken = new RefreshToken();

        refreshToken.userId = userId;
        refreshToken.token = token;
        refreshToken.expiresAt = expiresAt;
        refreshToken.isRevoked = false;

        await this.refreshTokenRepository.createAsync(refreshToken);

        return token;
    }

    async validateRefreshToken(token: string): Promise<ResultDto<RefreshToken>> {
        return this.executeServiceCall(
            'Validate Refresh Token',
            async () => {
                const spec = new BaseSpecification();

                spec.addCriteria(`token = '${token}'`);

                const tokens = await this.refreshTokenRepository.getAllAsync(spec);

                if (!tokens || tokens.length === 0) {
                    throw new UnauthorizedException('Invalid refresh token');
                }

                const refreshToken = tokens[0];

                if (refreshToken.isRevoked) {
                    throw new UnauthorizedException('Invalid refresh token');
                }

                if (new Date(refreshToken.expiresAt) < new Date()) {
                    throw new UnauthorizedException('Refresh token expired');
                }

                return refreshToken;
            }
        );
    }

    async refreshToken(oldRefreshToken: string): Promise<ResultDto<{ accessToken: string; refreshToken: string; expiresIn: number }>> {
        return this.executeServiceCall(
            'Refresh Token',
            async () => {
                const tokenResult = await this.validateRefreshToken(oldRefreshToken);

                if (!tokenResult.isSuccess || !tokenResult.data) {
                    throw new UnauthorizedException('Invalid refresh token');
                }

                const refreshToken = tokenResult.data;
                const user = await this.userRepository.getAsync(refreshToken.userId);

                if (!user) {
                    throw new UnauthorizedException('User not found');
                }

                await this.revokeRefreshToken(oldRefreshToken);

                const rolesResult = await this.getUserRoles(user.id);
                const roles = rolesResult.data || [];
                const payload = {
                    username: user.userName,
                    sub: user.id,
                    email: user.email,
                    roles
                };

                const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
                const newRefreshToken = await this.createRefreshToken(user.id);

                return {
                    accessToken,
                    refreshToken: newRefreshToken,
                    expiresIn: 900,
                };
            }
        );
    }

    async revokeRefreshToken(token: string): Promise<ResultDto<void>> {
        return this.executeServiceCall(
            'Revoke Refresh Token',
            async () => {
                const spec = new BaseSpecification();
                spec.addCriteria(`token = '${token}'`);

                const tokens = await this.refreshTokenRepository.getAllAsync(spec);

                if (tokens && tokens.length > 0) {
                    const refreshToken = tokens[0];
                    refreshToken.isRevoked = true;
                    await this.refreshTokenRepository.updateAsync(refreshToken);
                }
            }
        );
    }

    async logout(refreshToken: string): Promise<ResultDto<{ message: string }>> {
        return this.executeServiceCall(
            'Logout',
            async () => {
                await this.revokeRefreshToken(refreshToken);

                return { message: 'Logged out successfully' };
            }
        );
    }
}