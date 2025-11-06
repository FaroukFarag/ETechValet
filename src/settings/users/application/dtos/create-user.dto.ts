import { IsEmail, IsString, Matches, MinLength } from "class-validator";
import { RoleDto } from "src/settings/roles/application/dtos/role.dto";

export class CreateUserDto {
    @IsString()
    @MinLength(3)
    userName: string;

    @IsEmail()
    email: string;

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