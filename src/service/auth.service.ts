import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { JwtService } from '@nestjs/jwt';
import { Transaction } from 'sequelize/types';
import { AuthLoginQueryDto, AuthRegisterBodyDto, AuthUser } from '../dto/auth/auth.dto';
import { Encrypt } from '../common/encrypt/encrypt';
import { AuthRegisterVo, AuthLoginVo } from '../vo/auth.vo';
import { $ } from '../common/util/function';
import { UserDao } from '../dao/user.dao';
import { ConstData } from '../constant/data.const';

@Injectable()
export class AuthService extends BaseService {

    constructor(
        private readonly userDao: UserDao,
        private readonly jwtService: JwtService,
    ) {
        super();
    }

    public async login(
        params: AuthLoginQueryDto,
    ): Promise<AuthLoginVo> {
        const user = await this.userDao.findOneScopeAll({
            where: {
                account: params.account,
            },
        });
        if (!user) throw new UnauthorizedException();
        if (user.password !== Encrypt.make([params.password, user.id])) throw new UnauthorizedException();
        const token = await this.signInToken({ id: user.id });
        return {
            token,
        };
    }

    public async validRegister(
        params: AuthRegisterBodyDto,
        transaction?: Transaction,
    ) {
        const countOfUsers = await this.userDao.count({
            where: {
                account: params.account,
            },
            transaction,
        });
        if (countOfUsers > 0) throw new BadRequestException('账号已存在');
    }

    private async registerCore(
        params: AuthRegisterBodyDto,
        isRobot: ConstData.Boolean,
        transaction?: Transaction,
    ): Promise<AuthRegisterVo> {
        await this.validRegister(params);
        const id = $.getUuid();
        const user = await this.userDao.create({
            id,
            isRobot,
            account: params.account,
            password: Encrypt.make([params.password, id]),
        }, { transaction });
        return { account: user.account, id: user.id };
    }

    public async register(
        params: AuthRegisterBodyDto,
        transaction?: Transaction,
    ): Promise<AuthRegisterVo> {
        return this.registerCore(params, ConstData.Boolean.FALSE, transaction);
    }

    public async registerRobot(
        params: AuthRegisterBodyDto,
        transaction?: Transaction,
    ): Promise<AuthRegisterVo> {
        return this.registerCore(params, ConstData.Boolean.TRUE, transaction);
    }

    public async findOneById(id: string) {
        return this.userDao.findOne({ where: { id } });
    }

    public async findOneByIdOrThrow(id: string) {
        const user = await this.findOneById(id);
        if (!user) throw new NotFoundException();
        return user;
    }

    private async signInToken(data: AuthUser): Promise<string> {
        return `Bearer ${this.jwtService.sign(data)}`;
    }

}