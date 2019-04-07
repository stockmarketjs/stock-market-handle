import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { Stock } from '../entity/sequelize/stock.entity';
import { UserStockOrder } from '../entity/sequelize/user_stock_order.entity';

export class UserStockOrderFindAllVo extends UserStockOrder {
    @ApiModelPropertyOptional({ description: '股票数据' })
    stock?: Stock;
}