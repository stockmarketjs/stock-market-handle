import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { Transaction, Op } from 'sequelize';
import * as _ from 'lodash';
import { StockOrderDao } from '../dao/stock_order.dao';
import { StockOrderCreateBodyDto } from '../dto/stock_order/stock_order.dto';
import { Moment } from '../common/util/moment';
import { StockOrder } from '../entity/sequelize/stock_order.entity';
import { $ } from '../common/util/function';
import { UserStockOrderDao } from '../dao/user_stock_order.dao';
import { ConstData } from '../constant/data.const';
import { StockOrderFindAllBuyShift, StockOrderFindAllSoldShift, StockOrderFindAllCoreShift } from '../vo/stock_order.vo';
import { StockService } from './stock.service';

@Injectable()
export class StockOrderService extends BaseService {

    constructor(
        private readonly stockOrderDao: StockOrderDao,
        private readonly userStockOrderDao: UserStockOrderDao,
        private readonly stockService: StockService,
    ) {
        super();
    }

    public async findAllIdsShift(
        stockId: string,
        type: ConstData.TRADE_ACTION,
        transaction?: Transaction,
    ): Promise<string[]> {
        const res = await this.findAllShiftCore(
            stockId, type, 10, transaction,
        );
        return _.reduce(res, (sum, value) => {
            sum = sum.concat(value.ids);
            return sum;
        }, [] as string[]);
    }

    private async findAllShiftCore(
        stockId: string,
        type: ConstData.TRADE_ACTION,
        limitShift = 5,
        transaction?: Transaction,
    ): Promise<StockOrderFindAllCoreShift[]> {
        const userStockOrders = await this.userStockOrderDao.findAll({
            where: {
                stockId,
                state: ConstData.ORDER_STATE.READY,
                type,
            },
            transaction,
        });
        const groupOfBuy = _.groupBy(userStockOrders, 'price');
        const keys = _.keys(groupOfBuy);
        const keysSorted = keys.sort((a, b) => Number(a) - Number(b));
        const res: StockOrderFindAllCoreShift[] = [];
        for (const key of type === ConstData.TRADE_ACTION.BUY ? keysSorted.reverse() : keysSorted) {
            if (keys.indexOf(key) === limitShift) break;

            const userStockOrdersOfShift = groupOfBuy[key];
            res.push({
                shift: keys.indexOf(key) + 1,
                price: Number(key),
                hand: _.sumBy(userStockOrdersOfShift, 'hand'),
                ids: _.map(userStockOrdersOfShift, 'id'),
            });
        }
        return res;
    }

    private async findAllShift(
        stockId: string,
        type: ConstData.TRADE_ACTION,
        transaction?: Transaction,
    ): Promise<StockOrderFindAllBuyShift[]> {
        const res = await this.findAllShiftCore(
            stockId, type, 5, transaction,
        );
        return res.map(v => {
            return {
                hand: v.hand,
                shift: v.shift,
                price: v.price,
            } as StockOrderFindAllBuyShift;
        });
    }

    public async findAllSoldShift(
        stockId: string,
        transaction?: Transaction,
    ): Promise<StockOrderFindAllSoldShift[]> {
        return this.findAllShift(stockId, ConstData.TRADE_ACTION.SOLD, transaction);
    }

    public async findAllBuyShift(
        stockId: string,
        transaction?: Transaction,
    ): Promise<StockOrderFindAllBuyShift[]> {
        return this.findAllShift(stockId, ConstData.TRADE_ACTION.BUY, transaction);
    }

    public async create(
        params: StockOrderCreateBodyDto,
    ) {
        return this.stockOrderDao.create(params);
    }

    public async findAllOfDate(
        stockId: string,
        date: string = Moment().format('YYYY-MM-DD'),
    ) {
        const models = await this.stockOrderDao.findAll({
            where: {
                stockId,
                date,
            },
            order: [['createdAt', 'ASC']],
        });
        // 将所有数组, 分组成 分钟单位
        const group = _.groupBy(models, 'minute');
        // 历史数据的每分钟, 以那一分钟最后一笔交易为准
        const data: StockOrder[] = [];
        for (const minute in group) {
            const item = $.tail(group[minute]);
            data.push(item);
        }

        /**
         * 获取允许交易的时间
         */
        const periods = <{ begin: string, end: string }[]>ConstData.TRADE_PERIODS;
        // 格式化交易时间段
        const tradePeriods = _.map(periods, tradePeriod => {
            // return {
            //     begin: Moment(tradePeriod.begin, 'HH:mm').toISOString(),
            //     end: Moment(tradePeriod.end, 'HH:mm').toISOString(),
            // }
            const endMarket = Moment(tradePeriod.end, 'HH:mm');
            if (Moment().format('HHmm') >= endMarket.format('HHmm')) {
                return {
                    begin: Moment(tradePeriod.begin, 'HH:mm').toISOString(),
                    end: endMarket.seconds(0).milliseconds(0).toISOString(),
                };
            } else {
                return {
                    begin: Moment(tradePeriod.begin, 'HH:mm').toISOString(),
                    end: Moment().toISOString(),
                };
            }
        });
        const minutes = this.generateEmptyPeriods(tradePeriods);

        const stock = await this.stockService.findOneByIdOrThrow(stockId);
        const res: StockOrder[] = [];
        for (const minute of minutes) {
            const item = _.find(data, { minute });
            if (item) {
                res.push(item);
            } else {
                res.push(new StockOrder({
                    minute,
                    hand: 0,
                    price: $.tail(res) ? $.tail(res).price : stock.startPrice,
                }));
            }
        }

        return res;
    }

    public generateEmptyPeriods(periods: { begin: string, end: string }[]) {
        let res: string[] = [];

        for (const period of periods) {
            res = _.union(res, this.generateEmptyPeriod(period.begin, period.end));
        }

        return res;
    }

    public generateEmptyPeriod(begin: string, end: string) {
        const res: string[] = [];
        const beginObj = Moment(begin);
        const endObj = Moment(end);

        // 初始化, 先放第一个
        const initMinute = beginObj.format('HH:mm');
        res.push(initMinute);

        // 累加1分钟
        while (beginObj.unix() < endObj.unix()) {
            beginObj.add(1, 'minutes');
            res.push(beginObj.format('HH:mm'));
        }

        return res.sort();
    }

}
