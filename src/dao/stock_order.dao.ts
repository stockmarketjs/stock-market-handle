import { Injectable } from '@nestjs/common';
import { BaseDao } from './base.dao';
import { StockOrder } from '../entity/sequelize/stock_order.entity';

@Injectable()
export class StockOrderDao extends BaseDao<StockOrder> {

    protected readonly entity = StockOrder;

}