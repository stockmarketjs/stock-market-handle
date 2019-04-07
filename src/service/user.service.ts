import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { Transaction, Op } from 'sequelize';
import { UserDao } from '../dao/user.dao';
import { User } from '../entity/sequelize/user.entity';
import { ConstData } from '../constant/data.const';

@Injectable()
export class UserService extends BaseService {

    constructor(
        private readonly userDao: UserDao,
    ) {
        super();
    }

    public async findAll(
        transaction?: Transaction,
    ): Promise<User[]> {
        return this.userDao.findAll({ transaction });
    }

    public async findAllRobot(
        transaction?: Transaction,
    ): Promise<User[]> {
        return this.userDao.findAll({
            where: {
                isRobot: ConstData.Boolean.TRUE,
            },
            transaction,
        });
    }

    public async countUsers(
        option: {
            includeRobot: ConstData.Boolean,
        },
    ) {
        return this.userDao.count({
            where: {
                [Op.and]: [
                    option.includeRobot === ConstData.Boolean.TRUE ? undefined : {
                        isRobot: ConstData.Boolean.FALSE,
                    },
                ],
            },
        });
    }

}