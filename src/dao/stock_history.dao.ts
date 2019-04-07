import { Injectable } from '@nestjs/common';
import { BaseDao } from './base.dao';
import { StockHistory } from '../entity/sequelize/stock_history.entity';

@Injectable()
export class StockHistoryDao extends BaseDao<StockHistory> {

    protected readonly entity = StockHistory;

}