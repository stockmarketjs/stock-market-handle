import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException, Logger } from '@nestjs/common';
import { Transaction, Op } from 'sequelize';
import * as _ from 'lodash';
import { UserStockOrderService } from './user_stock_order.service';
import { Sequelize } from 'sequelize-typescript';
import { StockService } from './stock.service';
import { UserStockService } from './user_stock.service';
import { UserCapitalService } from './user_capital.service';
import { StockOrderService } from './stock_order.service';
import { ConstProvider } from '../constant/provider.const';
import { UserStockOrder } from '../entity/sequelize/user_stock_order.entity';
import { ConstData } from '../constant/data.const';
import { Calc } from '../common/util/calc';
import { Moment } from '../common/util/moment';
import { $ } from '../common/util/function';
import { UserStock } from '../entity/sequelize/user_stock.entity';
import { UserCapital } from '../entity/sequelize/user_capital.entity';

@Injectable()
export class OrderService {

    constructor(
        @Inject(ConstProvider.SEQUELIZE) private readonly sequelize: Sequelize,
        private readonly userStockOrderService: UserStockOrderService,
        private readonly stockService: StockService,
        private readonly userStockService: UserStockService,
        private readonly userCapitalService: UserCapitalService,
        private readonly stockOrderService: StockOrderService,
    ) { }

    public async lockReadyPool(
        readyPool: UserStockOrder[],
        transaction: Transaction,
    ) {
        await this.userStockOrderService.bulkUpdateByIds(readyPool.map(v => v.id), {
            state: ConstData.ORDER_STATE.TRADEING,
        }, transaction);
    }

    public async releaseReadyPool(
        readyPool: UserStockOrder[],
        transaction: Transaction,
    ) {
        await this.userStockOrderService.bulkUpdateByIds(readyPool.map(v => v.id), {
            state: ConstData.ORDER_STATE.READY,
        }, transaction);
    }

    public async handle() {
        const stocks = await this.stockService.findAll();
        for (const stock of stocks) {
            Logger.log(`开始核算 ${stock.name}`);
            const newTransaction = await this.sequelize.transaction();

            try {
                const readyPool = await this.userStockOrderService.findAllReadyByStockIdWithLock(stock.id, newTransaction);
                await this.lockReadyPool(readyPool, newTransaction);

                const finalOrders = this.calcOneStockFinalOrders(readyPool);
                Logger.log(`核算完毕成交单 ${stock.name}`);
                if (finalOrders.length === 0) {
                    Logger.log('暂无成交');
                    await newTransaction.rollback();
                    continue;
                }
                const trade = await this.trade(finalOrders, newTransaction);
                Logger.log(`资产交割完毕 ${stock.name}`);
                if (!trade) {
                    Logger.log('暂无交割');
                    await newTransaction.rollback();
                    continue;
                }
                await this.updateQuotation(trade, newTransaction);
                Logger.log(`行情刷新结束 ${stock.name}`);

                await this.releaseReadyPool(readyPool, newTransaction);
                await newTransaction.commit();
            } catch (e) {
                await newTransaction.rollback();
                throw e;
            }
        }
    }

    private async updateQuotation(
        trade: {
            stockId: string,
            hand: number,
            price: number,
        },
        transaction: Transaction,
    ) {
        return this.stockService.updateQuotation(trade.stockId, {
            finalPrice: trade.price,
            finalHand: trade.hand,
        }, transaction);
    }

    /**
     * 资产交割
     *
     * @param {{
     *         buyOrder: any,
     *         soldOrder: any,
     *         price: number,
     *         hand: number ,
     *     }[]} finalOrders
     * @returns
     * @memberof OrderService
     */
    private async trade(
        finalOrders: {
            buyOrder: UserStockOrder,
            soldOrder: UserStockOrder,
            price: number,
            hand: number,
        }[],
        transaction: Transaction,
    ) {
        // 锁用户股票账户, 防止重复锁
        const lockUserStocks: { stockId: string, userId: string }[] = [];
        for (const finalOrder of finalOrders) {
            lockUserStocks.push({
                userId: finalOrder.buyOrder.userId,
                stockId: finalOrder.buyOrder.stockId,
            }, {
                    userId: finalOrder.soldOrder.userId,
                    stockId: finalOrder.soldOrder.stockId,
                });
        }
        const uniqLockUserStocks: { stockId: string, userId: string }[] = _.uniqWith(lockUserStocks, _.isEqual);
        await this.userStockService.findAllByPkLock(
            uniqLockUserStocks.map(v => {
                return {
                    userId: v.userId,
                    stockId: v.stockId,
                };
            }),
            transaction,
        );
        // 锁用户资金账户, 防止重复锁
        const lockUserCapitals: { userId: string }[] = [];
        for (const finalOrder of finalOrders) {
            lockUserCapitals.push({
                userId: finalOrder.buyOrder.userId,
            }, {
                    userId: finalOrder.soldOrder.userId,
                });
        }
        const uniqLockUserCapitals: { userId: string }[] = _.uniqWith(lockUserCapitals, _.isEqual);
        await this.userCapitalService.findAllByPkLock(
            uniqLockUserCapitals.map(v => v.userId),
            transaction,
        );

        for (const finalOrder of finalOrders) {
            const payOfBuyer = Calc.calcStockBuyCost(finalOrder.buyOrder.hand, finalOrder.price);

            // 先解冻买方资金
            // 扣减买方资金
            await this.userCapitalService.unfrozenUserCapitalWhenCost(
                finalOrder.buyOrder.userId,
                payOfBuyer,
                transaction,
            );
            await this.userCapitalService.subtractUserCapital(
                finalOrder.buyOrder.userId,
                payOfBuyer,
                transaction,
            );
            // 增加卖方资金
            await this.userCapitalService.addUserCapital(
                finalOrder.soldOrder.userId,
                payOfBuyer,
                transaction,
            );
            // 增加买方股票
            await this.userStockService.addUserStock(
                finalOrder.buyOrder.userId,
                finalOrder.buyOrder.stockId,
                finalOrder.hand * 100,
                finalOrder.price,
                transaction,
            );
            // 先解冻卖方股票
            await this.userStockService.unfrozenUserStockWhenCost(
                finalOrder.soldOrder.userId,
                finalOrder.soldOrder.stockId,
                finalOrder.hand * 100,
                transaction,
            );
            // 扣减卖方股票
            await this.userStockService.subtractUserStock(
                finalOrder.soldOrder.userId,
                finalOrder.soldOrder.stockId,
                finalOrder.hand * 100,
                finalOrder.price,
                transaction,
            );

            // 改变订单状态
            await this.userStockOrderService.bulkUpdateByIds([
                finalOrder.buyOrder.id,
                finalOrder.soldOrder.id,
            ], {
                    state: ConstData.ORDER_STATE.SUCCESS,
                }, transaction);

            // 写入成交的交易记录
            await this.stockOrderService.create({
                stockId: finalOrder.buyOrder.stockId,
                price: finalOrder.price,
                minute: Moment().format('HH:mm'),
                hand: finalOrder.hand,
                date: Moment().format('YYYY-MM-DD'),
            });
        }

        return $.tail(finalOrders) ? {
            stockId: $.tail(finalOrders).buyOrder.stockId,
            price: $.tail(finalOrders).price,
            hand: $.tail(finalOrders).hand,
        } : null;
    }

    /**
     * 计算撮合一只股票的成交数据
     *
     * @param {string} stockId
     * @param {Transaction} [transaction]
     * @returns
     * @memberof OrderService
     */
    private calcOneStockFinalOrders(
        readyPool: UserStockOrder[],
    ): {
        buyOrder: UserStockOrder,
        soldOrder: UserStockOrder,
        price: number,
        hand: number,
    }[] {
        const finalOrders: {
            buyOrder: UserStockOrder,
            soldOrder: UserStockOrder,
            price: number,
            hand: number,
        }[] = [];

        // 获取限价池
        const limitReadyPools = _.filter(readyPool, { mode: ConstData.TRADE_MODE.LIMIT });
        // 获取最新订单们
        const orders = _.orderBy(limitReadyPools, 'createdAt', 'desc');
        for (const order of orders) {
            const finalOrder = this.matchTrade(readyPool, order);
            if (finalOrder != null) finalOrders.push(finalOrder);
        }
        if (finalOrders.length === 0) Logger.log('没有可以撮合的');
        return finalOrders;
    }

    /**
     * 撮合交易
     *
     * @private
     * @param {UserStockOrder[]} readyPool
     * @returns
     * @memberof OrderService
     */
    private matchTrade(
        readyPool: UserStockOrder[],
        currentOrder: UserStockOrder,
    ): {
        buyOrder: UserStockOrder,
        soldOrder: UserStockOrder,
        price: number,
        hand: number,
    } | null {
        // 获取限价买单池 较高价格优先 时间优先
        const buyOrders = _(readyPool).filter({ type: ConstData.TRADE_ACTION.BUY })
            .orderBy(['price', 'createdAt'], ['desc', 'asc']).value();
        // 获取限价卖单池 较低价格优先 时间优先
        const soldOrders = _(readyPool).filter({ type: ConstData.TRADE_ACTION.SOLD })
            .orderBy(['price', 'createdAt'], ['asc', 'asc']).value();

        // 最高买入订单
        const highestBuyOrder = _.first(buyOrders);
        // 最低卖出订单
        const lowestSoldOrder = _.first(soldOrders);
        // 没有买单卖单, 无法交易
        if (!highestBuyOrder || !lowestSoldOrder) return null;

        const finalOrder = this.calcFinalPrice(highestBuyOrder, lowestSoldOrder, currentOrder);
        if (!finalOrder) {
            return null;
        } else {
            if (finalOrder.buyOrder.hand === finalOrder.soldOrder.hand) {
                // 移除已经成交的订单
                _.remove(readyPool, pool => {
                    return [
                        finalOrder.buyOrder.id,
                        finalOrder.soldOrder.id,
                    ].indexOf(pool.id) >= 0;
                });
                // 执行交易
                return _.assign(finalOrder, { hand: finalOrder.buyOrder.hand });
            } else if (finalOrder.buyOrder.hand > finalOrder.soldOrder.hand) {
                // 移除已经完全成交订单
                _.remove(readyPool, pool => {
                    return pool.id === finalOrder.soldOrder.id;
                });
                // 将订单的买方和卖方的手数修改成一致
                const source = _.cloneDeep(finalOrder);
                source.buyOrder.hand = finalOrder.soldOrder.hand;
                // 扣减部分成交的手数
                const a = _.find(readyPool, pool => {
                    return pool.id === finalOrder.buyOrder.id;
                });
                if (a) a.hand -= finalOrder.soldOrder.hand;
                // 执行交易
                return _.assign(source, { hand: finalOrder.soldOrder.hand });
            } else if (finalOrder.buyOrder.hand < finalOrder.soldOrder.hand) {
                // 移除已经完全成交订单
                _.remove(readyPool, pool => {
                    return pool.id === finalOrder.buyOrder.id;
                });
                // 将订单的买方和卖方的手数修改成一致
                const source = _.cloneDeep(finalOrder);
                source.soldOrder.hand = finalOrder.buyOrder.hand;
                // 扣减部分成交的手数
                const a = _.find(readyPool, pool => {
                    return pool.id === finalOrder.soldOrder.id;
                });
                if (a) a.hand -= finalOrder.buyOrder.hand;
                // 执行交易
                return _.assign(source, { hand: finalOrder.buyOrder.hand });
            } else {
                throw Error('计算买卖手数出现问题');
            }
        }
    }

    /**
     * 成交价规则
     *
     * @private
     * @param {UserStockOrder} highestBuyOrder
     * @param {UserStockOrder} lowestSoldOrder
     * @param {UserStockOrder} currentOrder
     * @returns {({
     *         buyOrder: UserStockOrder,
     *         soldOrder: UserStockOrder,
     *         price: number,
     *     } | null)}
     * @memberof OrderService
     */
    private calcFinalPrice(
        highestBuyOrder: UserStockOrder,
        lowestSoldOrder: UserStockOrder,
        currentOrder: UserStockOrder,
    ): {
        buyOrder: UserStockOrder,
        soldOrder: UserStockOrder,
        price: number,
    } | null {

        // 最高买入价格 与 最低卖出价格 相同, 则立即成交
        if (highestBuyOrder && lowestSoldOrder &&
            highestBuyOrder.price === lowestSoldOrder.price) {
            return {
                buyOrder: highestBuyOrder,
                soldOrder: lowestSoldOrder,
                price: highestBuyOrder.price,
            };
        }
        // 申报价格买入 > 最低卖出价格, 则以最低卖出价格成交
        else if (lowestSoldOrder && currentOrder.type === ConstData.TRADE_ACTION.BUY &&
            currentOrder.price > lowestSoldOrder.price) {
            return {
                buyOrder: currentOrder,
                soldOrder: lowestSoldOrder,
                price: lowestSoldOrder.price,
            };
        }
        // 申报价格卖出 < 最高买入价格, 则以最高买入价格成交
        else if (highestBuyOrder && currentOrder.type === ConstData.TRADE_ACTION.SOLD &&
            currentOrder.price < highestBuyOrder.price) {
            return {
                buyOrder: highestBuyOrder,
                soldOrder: currentOrder,
                price: highestBuyOrder.price,
            };
        }
        // 撮合失败
        else {
            return null;
        }
    }

}
