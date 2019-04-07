import { UserStock } from '../entity/sequelize/user_stock.entity';
import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { Stock } from '../entity/sequelize/stock.entity';

export class UserStockFindAllVo extends UserStock {
    @ApiModelPropertyOptional({ description: '股票数据' })
    stock?: Stock;
}