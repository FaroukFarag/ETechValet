import { IsEmail, IsString, Matches, MinLength } from "class-validator";
import { RoleDto } from "src/settings/roles/application/dtos/role.dto";
import { UserGateDto } from "src/settings/users-gates/application/dtos/user-gate.dto";

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    userName: string;

    @IsEmail()
    email: string;

    @Matches(/^(?:00966|\+966|0)?5\d{8}$/, {
        message: 'Invalid phone number',
    })
    phoneNumber: string;

    @IsString()
    @MinLength(8)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password too weak',
    })
    password: string;

    @IsString()
    confirmPassword: string;

    roles: RoleDto[];
}