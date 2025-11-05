import { IsNumber, IsString, MinLength } from "class-validator";

export class ChangePasswordDto {
    @IsNumber()
    userId: number;

    @IsString()
    currentPassword: string;

    @IsString()
    @MinLength(8)
    newPassword: string;
}