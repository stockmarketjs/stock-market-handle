import { ApiModelProperty } from '@nestjs/swagger';

export class AuthLoginVo {
    @ApiModelProperty({ description: 'TOKEN' })
    readonly token: string;
}

export class AuthRegisterVo {
    @ApiModelProperty({ description: 'ID' })
    readonly id: string;
    @ApiModelProperty({ description: '账号' })
    readonly account: string;
}