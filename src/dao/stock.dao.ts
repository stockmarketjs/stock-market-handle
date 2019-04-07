import { Injectable } from '@nestjs/common';
import { BaseDao } from './base.dao';
import { Stock } from '../entity/sequelize/stock.entity';

@Injectable()
export class StockDao extends BaseDao<Stock> {

    protected readonly entity = Stock;

}