import { Injectable } from '@nestjs/common';
import { BaseDao } from './base.dao';
import { UserStock } from '../entity/sequelize/user_stock.entity';

@Injectable()
export class UserStockDao extends BaseDao<UserStock> {

    protected readonly entity = UserStock;

}