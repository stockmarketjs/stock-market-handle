import { Injectable } from '@nestjs/common';
import { BaseDao } from './base.dao';
import { UserStockOrder } from '../entity/sequelize/user_stock_order.entity';

@Injectable()
export class UserStockOrderDao extends BaseDao<UserStockOrder> {

    protected readonly entity = UserStockOrder;

}