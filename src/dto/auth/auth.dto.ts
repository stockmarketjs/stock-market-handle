import { IsDefined, IsString } from 'class-validator';
import { ApiModelProperty } from '@nestjs/swagger';

export class AuthUser {
    readonly id: string;
}

export class AuthLoginDto {
    @ApiModelProperty({ description: '帐号' })
    @IsDefined() @IsString()
    readonly account: string;
    @ApiModelProperty({ description: '密码' })
    @IsDefined() @IsString()
    readonly password: string;
}

export class AuthLoginBodyDto extends AuthLoginDto {

}

export class AuthRegisterBodyDto extends AuthLoginDto {

}

export class AuthLoginQueryDto extends AuthLoginDto {

}
