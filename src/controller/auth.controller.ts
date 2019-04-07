import { Controller, Get, Query, UseGuards, HttpStatus, Post, Body } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { AuthLoginQueryDto, AuthUser, AuthLoginBodyDto, AuthRegisterBodyDto } from '../dto/auth/auth.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiUseTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from '../entity/sequelize/user.entity';
import { Operator } from '../decorator/operator.decorator';
import { AuthLoginVo, AuthRegisterVo } from '../vo/auth.vo';

@ApiBearerAuth()
@ApiUseTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
    ) { }

    @ApiOperation({ title: '连接状态' })
    @ApiResponse({ status: HttpStatus.OK, type: String })
    @Get('connection')
    public async getLogin(
    ): Promise<String> {
        return 'ok';
    }

}
