import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { Sequelize } from 'sequelize-typescript';
import * as _ from 'lodash';
import { UserCapitalService } from './user_capital.service';
import { UserStockService } from './user_stock.service';
import { UserStockOrderService } from './user_stock_order.service';
import { ConstProvider } from '../constant/provider.const';
import { UserService } from './user.service';
import { ConstData } from '../constant/data.const';
import { StockSummaryCountVo } from '../vo/stock_summary.vo';

@Injectable()
export class StockSummaryService extends BaseService {

    constructor(
        @Inject(ConstProvider.SEQUELIZE) private readonly sequelize: Sequelize,
        private readonly userCapitalService: UserCapitalService,
        private readonly userStockService: UserStockService,
        private readonly userStockOrderService: UserStockOrderService,
        private readonly userService: UserService,
    ) {
        super();
    }

    public async getMarketSummary(): Promise<StockSummaryCountVo[]> {
        const userSummaries = await this.getUserCount();
        return _.union(userSummaries);
    }

    public async getRankSummary(): Promise<StockSummaryCountVo[]> {
        const rankSummaries = await this.getUserCashRankingSummary();
        return _.union(rankSummaries);
    }

    private async getUserCashRankingSummary(): Promise<StockSummaryCountVo[]> {
        const userCapitals = await this.userCapitalService.findAllOrderCash(10);
        return userCapitals.map(userCapital => {
            return {
                name: _.padEnd(userCapital.userId.slice(0, 6), 12, '*'),
                value: userCapital.cash,
            };
        });
    }

    private async getUserCount(): Promise<StockSummaryCountVo[]> {
        const users = await this.userService.countUsers({
            includeRobot: ConstData.Boolean.FALSE,
        });
        const allUsers = await this.userService.countUsers({
            includeRobot: ConstData.Boolean.TRUE,
        });
        return [
            {
                name: '真实用户数',
                value: users,
            },
            {
                name: '机器人数',
                value: allUsers - users,
            },
            {
                name: '全部用户数',
                value: allUsers,
            },
        ];
    }

}