import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { Transaction, Op } from 'sequelize';
import * as _ from 'lodash';
import { UserCapitalDao } from '../dao/user_capital.dao';

@Injectable()
export class UserCapitalService extends BaseService {

    constructor(
        private readonly userCapitalDao: UserCapitalDao,
    ) {
        super();
    }

    public async findOneByUserId(
        userId: string,
        transaction?: Transaction,
    ) {
        return this.userCapitalDao.findOne({ where: { userId }, transaction });
    }

    public async findOneByUserIdOrThrow(
        userId: string,
        transaction?: Transaction,
    ) {
        const userCapital = await this.findOneByUserId(userId, transaction);
        if (!userCapital) throw new NotFoundException();
        return userCapital;
    }

    public async validCreate(
        userId: string,
        transaction?: Transaction,
    ) {
        const count = await this.userCapitalDao.count({
            where: {
                userId,
            },
            transaction,
        });
        if (count === 1) throw new BadRequestException('不能重复创建人民币账户');
    }

    public async create(
        userId: string,
        transaction?: Transaction,
    ) {
        await this.validCreate(userId, transaction);
        return this.userCapitalDao.create({
            userId,
            cash: 0,
        }, { transaction });
    }

    public async findOneByPkLock(
        userId: string,
        transaction: Transaction,
    ) {
        return this.userCapitalDao.findOne({
            where: {
                userId,
            },
            transaction,
            lock: Transaction.LOCK.UPDATE,
        });
    }

    public async findAllByPkLock(
        userIds: string[],
        transaction: Transaction,
    ) {
        return this.userCapitalDao.findAll({
            where: {
                userId: {
                    [Op.in]: userIds,
                },
            },
            transaction,
            lock: Transaction.LOCK.UPDATE,
        });
    }

    /**
     * XXX: 注意, 使用该方法, 需要自行上锁
     *
     * @param {string} userId
     * @param {number} value
     * @param {Transaction} transaction
     * @returns
     * @memberof UserCapitalService
     */
    public async subtractUserCapital(
        userId: string,
        value: number,
        transaction: Transaction,
    ) {
        return this.operatorUserCapital(
            userId,
            -value,
            transaction,
        );
    }

    /**
     * XXX: 注意, 使用该方法, 需要自行上锁
     *
     * @param {string} userId
     * @param {number} value
     * @param {Transaction} transaction
     * @returns
     * @memberof UserCapitalService
     */
    public async addUserCapital(
        userId: string,
        value: number,
        transaction: Transaction,
    ) {
        return this.operatorUserCapital(
            userId,
            value,
            transaction,
        );
    }

    private async operatorUserCapital(
        userId: string,
        value: number,
        transaction: Transaction,
    ) {
        const userCapital = await this.userCapitalDao.findOne({
            where: {
                userId,
            },
            transaction,
        });
        if (!userCapital) throw new BadRequestException('没有对应的资金账户');
        return this.userCapitalDao.update({
            cash: userCapital.cash + value,
        }, {
                where: { id: userCapital.id },
                transaction,
            });
    }

    /**
     * XXX: 注意, 使用该方法, 需要自行上锁
     *
     * @param {string} userId
     * @param {number} value
     * @param {Transaction} [transaction]
     * @returns
     * @memberof UserCapitalService
     */
    public async frozenUserCapitalWhenCost(
        userId: string,
        value: number,
        transaction?: Transaction,
    ) {
        const userCapital = await this.userCapitalDao.findOne({
            where: {
                userId,
            },
            transaction,
        });
        if (!userCapital) throw new BadRequestException('没有对应的资金账户');
        return this.userCapitalDao.update({
            frozenCash: userCapital.frozenCash + value,
            cash: userCapital.cash - value,
        }, {
                where: { id: userCapital.id },
                transaction,
            });
    }

    /**
     * XXX: 注意, 使用该方法, 需要自行上锁
     *
     * @param {string} userId
     * @param {number} value
     * @param {Transaction} [transaction]
     * @returns
     * @memberof UserCapitalService
     */
    public async unfrozenUserCapitalWhenCost(
        userId: string,
        value: number,
        transaction?: Transaction,
    ) {
        const userCapital = await this.userCapitalDao.findOne({
            where: {
                userId,
            },
            transaction,
        });
        if (!userCapital) throw new BadRequestException('没有对应的资金账户');
        return this.userCapitalDao.update({
            frozenCash: userCapital.frozenCash - value,
            cash: userCapital.cash + value,
        }, {
                where: { id: userCapital.id },
                transaction,
            });
    }

    public async findAllOrderCash(
        limit: number,
    ) {
        return this.userCapitalDao.findAll({
            order: [['cash', 'DESC']],
            attributes: ['userId', 'cash'],
            limit,
        });
    }

}