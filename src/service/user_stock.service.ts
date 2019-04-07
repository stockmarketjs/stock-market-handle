import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { Transaction, Op } from 'sequelize';
import * as _ from 'lodash';
import { UserStockDao } from '../dao/user_stock.dao';
import { Calc } from '../common/util/calc';
import { UserStockFindAllVo } from '../vo/user_stock.vo';
import { StockDao } from '../dao/stock.dao';

@Injectable()
export class UserStockService extends BaseService {

    constructor(
        private readonly userStockDao: UserStockDao,
        private readonly stockDao: StockDao,
    ) {
        super();
    }

    public async findOneByUserIdStockId(
        stockId: string,
        userId: string,
        transaction?: Transaction,
    ) {
        return this.userStockDao.findOne({ where: { userId, stockId }, transaction });
    }

    public async findOneByUserIdStockIdOrThrow(
        userId: string,
        stockId: string,
        transaction?: Transaction,
    ) {
        const userStock = await this.findOneByUserIdStockId(stockId, userId, transaction);
        if (!userStock) throw new NotFoundException();
        return userStock;
    }

    public async findAllByUserId(
        userId: string,
        transaction?: Transaction,
    ): Promise<UserStockFindAllVo[]> {
        const res = await this.userStockDao.findAll({
            where: {
                userId,
            },
            transaction,
        });
        const stocks = await this.stockDao.findAll({
            where: {
                id: {
                    [Op.in]: _.map(res, 'stockId'),
                },
            },
        });
        return res.map(item => {
            const stock = _.find(stocks, { id: item.stockId });
            item.setDataValue<any>('stock', stock);
            return item;
        });
    }

    public async findOneByPkLock(
        userId: string,
        stockId: string,
        transaction: Transaction,
    ) {
        return this.userStockDao.findOne({
            where: {
                userId,
                stockId,
            },
            transaction,
            lock: Transaction.LOCK.UPDATE,
        });
    }

    public async findAllByPkLock(
        userStocks: {
            userId: string,
            stockId: string,
        }[],
        transaction: Transaction,
    ) {
        const modelsOfId: string[] = [];
        for (const userStock of userStocks) {
            const model = await this.userStockDao.findOne({
                where: {
                    userId: userStock.userId,
                    stockId: userStock.stockId,
                },
                attributes: ['id'],
                transaction,
            });
            if (model) modelsOfId.push(model.id);
        }
        if (modelsOfId.length === 0) return [];
        return this.userStockDao.findAll({
            where: {
                id: {
                    [Op.in]: modelsOfId,
                },
            },
            transaction,
            lock: Transaction.LOCK.UPDATE,
        });
    }

    public async subtractUserStock(
        userId: string,
        stockId: string,
        value: number,
        costPrice: number,
        transaction: Transaction,
    ) {
        return this.operatorUserStock(
            userId,
            stockId,
            -value,
            costPrice,
            transaction,
        );
    }

    public async addUserStock(
        userId: string,
        stockId: string,
        value: number,
        costPrice: number,
        transaction: Transaction,
    ) {
        return this.operatorUserStock(
            userId,
            stockId,
            value,
            costPrice,
            transaction,
        );
    }

    private async operatorUserStock(
        userId: string,
        stockId: string,
        value: number,
        costPrice: number,
        transaction: Transaction,
    ) {
        const userStock = await this.userStockDao.findOne({
            where: {
                userId,
                stockId,
            },
            transaction,
        });
        if (!userStock && value <= 0) {
            throw new BadRequestException('没有足额的股票');
        } else if (!userStock) {
            await this.userStockDao.create({
                userId,
                stockId,
                amount: value,
                costPrice,
            }, { transaction });
            return true;
        }

        // 累计求均价
        const avgCostPrice = value > 0 ?
            // 加法
            Calc.div(
                Calc.add(
                    Calc.mul(userStock.amount, userStock.costPrice),
                    Calc.mul(costPrice, value),
                ),
                Calc.add(
                    userStock.amount,
                    value,
                ),
            ) :
            // 减法
            userStock.costPrice;

        return this.userStockDao.update({
            amount: userStock.amount + value,
            costPrice: avgCostPrice,
        }, {
                where: { id: userStock.id },
                transaction,
            });
    }

    /**
     * XXX: 注意, 使用该方法, 需要自行上锁
     */
    public async frozenUserStockWhenCost(
        userId: string,
        stockId: string,
        value: number,
        transaction?: Transaction,
    ) {
        const userStock = await this.userStockDao.findOne({
            where: {
                userId,
                stockId,
            },
            transaction,
        });
        if (!userStock) throw new BadRequestException('没有足额的股票');
        return this.userStockDao.update({
            frozenAmount: userStock.frozenAmount + value,
            amount: userStock.amount - value,
        }, {
                where: { id: userStock.id },
                transaction,
            });
    }

    /**
     * XXX: 注意, 使用该方法, 需要自行上锁
     */
    public async unfrozenUserStockWhenCost(
        userId: string,
        stockId: string,
        value: number,
        transaction?: Transaction,
    ) {
        const userStock = await this.userStockDao.findOne({
            where: {
                userId,
                stockId,
            },
            transaction,
        });
        if (!userStock) throw new BadRequestException('没有足额的股票');
        return this.userStockDao.update({
            frozenAmount: userStock.frozenAmount - value,
            amount: userStock.amount + value,
        }, {
                where: { id: userStock.id },
                transaction,
            });
    }

}