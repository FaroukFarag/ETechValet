import { Body, Controller, Patch, Post, UseGuards } from '@nestjs/common';
import { BaseController } from 'src/shared/presentation/controllers/base.controller';
import { UserDto } from 'src/settings/users/application/dtos/user.dto';
import { UserService } from 'src/settings/users/application/services/user.service';
import { User } from 'src/settings/users/domain/models/user.model';
import { Public } from '../decorators/public.decorator';
import { LoginDto } from 'src/settings/users/application/dtos/login.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { ChangePasswordDto } from 'src/settings/users/application/dtos/change-password.dto';
import { CreateUserDto } from 'src/settings/users/application/dtos/create-user.dto';

@Controller('api/users')
export class UsersController extends BaseController<
    UserService,
    CreateUserDto,
    UserDto,
    UserDto,
    UserDto,
    User,
    number> {
    constructor(private readonly userService: UserService) {
        super(userService);
    }

    @Public()
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return await this.userService.login(loginDto);
    }

    @Public()
    @Post('refresh')
    async refresh(@Body('refreshToken') refreshToken: string) {
        return await this.userService.refreshToken(refreshToken);
    }

    @Post('logout')
    async logout(@Body('refreshToken') refreshToken: string) {
        return await this.userService.logout(refreshToken);
    }

    @Patch('update-member-data')
    async updateMemberData(@Body() userDto: UserDto) {
        return await this.userService.updateMemberData(userDto);
    }
    @Post('change-password')
    @UseGuards(JwtAuthGuard)
    async changePassword(
        @CurrentUser() user: any,
        @Body() changePasswordDto: ChangePasswordDto,
    ) {
        await this.userService.changePassword(changePasswordDto);

        return { message: 'Password changed successfully' };
    }
}
