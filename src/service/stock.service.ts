import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { Sequelize } from 'sequelize-typescript';
import { Transaction } from 'sequelize';
import * as _ from 'lodash';
import { UserCapitalService } from './user_capital.service';
import { UserStockService } from './user_stock.service';
import { UserStockOrderService } from './user_stock_order.service';
import { StockDao } from '../dao/stock.dao';
import { ConstProvider } from '../constant/provider.const';
import { StockCapitalDao } from '../dao/stock_capital.dao';
import { StockFindAllDto, StockUpdateDto } from '../dto/stock/stock.dto';
import { Calc } from '../common/util/calc';
import { Moment } from '../common/util/moment';
import { ConstData } from '../constant/data.const';

@Injectable()
export class StockService extends BaseService {

    constructor(
        @Inject(ConstProvider.SEQUELIZE) private readonly sequelize: Sequelize,
        private readonly stockDao: StockDao,
        private readonly stockCapitalDao: StockCapitalDao,
        private readonly userCapitalService: UserCapitalService,
        private readonly userStockService: UserStockService,
        private readonly userStockOrderService: UserStockOrderService,
    ) {
        super();
    }

    public async findOneById(
        id: string,
        transaction?: Transaction,
    ) {
        return this.stockDao.findOne({ where: { id }, transaction });
    }

    public async findOneByIdOrThrow(
        id: string,
        transaction?: Transaction,
    ) {
        const stock = await this.findOneById(id, transaction);
        if (!stock) throw new NotFoundException();
        return stock;
    }

    public async findAll(
        transaction?: Transaction,
    ): Promise<StockFindAllDto[]> {
        const stocks = await this.stockDao.findAll({ transaction });
        for (const stock of stocks) {
            const stockCapital = await this.stockCapitalDao.findOne({ where: { stockId: stock.id }, transaction });
            Object.assign(stock, {
                turnoverPer: !stockCapital ? 0 : Calc.formatToPer(stock.totalHand / stockCapital.generalCapital * 100),
                risePer: Calc.formatToPer(stock.change / (stock.currentPrice - stock.change) * 100),
            });
        }
        return stocks as StockFindAllDto[];
    }

    public async startQuotation(
        id: string,
        transaction?: Transaction,
    ) {
        const stock = await this.findOneById(id, transaction);
        if (!stock) throw new NotFoundException();

        await this.stockDao.update({
            change: 0,
            startPrice: stock.currentPrice,
            endPrice: 0,
            highestPrice: stock.currentPrice,
            lowestPrice: stock.currentPrice,
        }, {
                where: {
                    id,
                },
                transaction,
            });
    }

    public async endQuotation(
        id: string,
        transaction?: Transaction,
    ) {
        const stock = await this.findOneById(id, transaction);
        if (!stock) throw new NotFoundException();

        await this.stockDao.update({
            endPrice: stock.currentPrice,
        }, {
                where: {
                    id,
                },
                transaction,
            });
    }

    public async updateQuotation(
        id: string,
        params: StockUpdateDto,
        transaction?: Transaction,
    ) {
        const newTransaction = !transaction;
        transaction = transaction ? transaction : await this.sequelize.transaction();

        try {
            const stock = await this.findOneById(id, transaction);
            if (!stock) throw new NotFoundException();

            await this.stockDao.update({
                currentPrice: params.finalPrice,
                change: Calc.sub(params.finalPrice, stock.startPrice),
                totalHand: Calc.add(stock.totalHand, params.finalHand),
                highestPrice: params.finalPrice > stock.highestPrice ? params.finalPrice : undefined,
                lowestPrice: params.finalPrice < stock.lowestPrice ? params.finalPrice : undefined,
            }, {
                    where: {
                        id,
                    },
                    transaction,
                });

            newTransaction && (await transaction.commit());
        } catch (e) {
            newTransaction && (await transaction.rollback());
            throw e;
        }
    }

    public validInTradeTime(dateTime: string = Moment().toISOString()) {
        const tradePeriods = <{ begin: string, end: string }[]>ConstData.TRADE_PERIODS;
        for (const tradePeriod of tradePeriods) {
            const begin = Moment(tradePeriod.begin, 'HH:mm');
            let end = Moment(tradePeriod.end, 'HH:mm');
            if (tradePeriod.begin > tradePeriod.end) {
                end = Moment(tradePeriod.end, 'HH:mm').add(1, 'days');
            }

            if (begin.unix() <= Moment(dateTime).unix() &&
                end.unix() >= Moment(dateTime).unix()) {
                return true;
            }
        }
        throw new BadRequestException('当前时间已经休市');
    }

    public async buy(
        id: string,
        price: number,
        hand: number,
        operatorId: string,
        transaction?: Transaction,
    ) {
        const newTransaction = !transaction;
        transaction = transaction ? transaction : await this.sequelize.transaction();

        try {
            this.validInTradeTime();
            await this.validEnoughCapital(operatorId, price, hand, transaction);

            await this.userCapitalService.findOneByPkLock(
                operatorId, transaction,
            );
            const cost = Calc.calcStockBuyCost(hand, price);
            await this.userCapitalService.frozenUserCapitalWhenCost(
                operatorId, cost, transaction,
            );

            const userStockOrder = await this.trade(id, price, hand, operatorId, ConstData.TRADE_ACTION.BUY, undefined, transaction);

            newTransaction && await transaction.commit();
            return userStockOrder;
        } catch (e) {
            newTransaction && await transaction.rollback();
            throw e;
        }
    }

    public async sold(
        id: string,
        price: number,
        hand: number,
        operatorId: string,
        transaction?: Transaction,
    ) {
        const newTransaction = !transaction;
        transaction = transaction ? transaction : await this.sequelize.transaction();

        try {
            this.validInTradeTime();
            await this.validEnoughStock(operatorId, id, hand, transaction);

            await this.userStockService.findOneByPkLock(
                operatorId, id, transaction,
            );
            await this.userStockService.frozenUserStockWhenCost(
                operatorId, id, hand * 100, transaction,
            );

            const userStockOrder = await this.trade(id, price, hand, operatorId, ConstData.TRADE_ACTION.SOLD, undefined, transaction);

            newTransaction && await transaction.commit();
            return userStockOrder;
        } catch (e) {
            newTransaction && await transaction.rollback();
            throw e;
        }
    }

    public async trade(
        stockId: string,
        price: number,
        hand: number,
        operatorId: string,
        type: ConstData.TRADE_ACTION,
        mode: ConstData.TRADE_MODE = ConstData.TRADE_MODE.LIMIT,
        transaction?: Transaction,
    ) {
        return this.userStockOrderService.create({
            stockId,
            price,
            hand,
            mode,
            userId: operatorId,
            type,
            state: ConstData.ORDER_STATE.READY,
        }, transaction);
    }

    public async validEnoughCapital(
        userId: string,
        price: number,
        hand: number,
        transaction?: Transaction,
    ) {
        const userCapital = await this.userCapitalService.findOneByUserIdOrThrow(userId, transaction);
        if (Calc.calcStockBuyRemain(userCapital.cash, price, hand) < 0) {
            throw new BadRequestException('资金不足');
        }
    }

    public async validEnoughStock(
        userId: string,
        stockId: string,
        hand: number,
        transaction?: Transaction,
    ) {
        const userStock = await this.userStockService.findOneByUserIdStockIdOrThrow(userId, stockId, transaction);
        if (userStock.amount < hand * 100) {
            throw new BadRequestException('没有足够的股票');
        }
    }

}