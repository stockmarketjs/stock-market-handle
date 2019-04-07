import { Module } from '@nestjs/common';
import { DatabaseModule } from '../provider/database/database.module';
import { UserDao } from '../dao/user.dao';
import { StockDao } from '../dao/stock.dao';
import { StockHistoryDao } from '../dao/stock_history.dao';
import { StockOrderDao } from '../dao/stock_order.dao';
import { UserCapitalDao } from '../dao/user_capital.dao';
import { UserStockDao } from '../dao/user_stock.dao';
import { StockCapitalDao } from '../dao/stock_capital.dao';
import { UserStockOrderDao } from '../dao/user_stock_order.dao';

@Module({
    imports: [DatabaseModule],
    providers: [
        UserDao, StockDao, StockHistoryDao, StockOrderDao, UserCapitalDao, UserStockDao,
        StockCapitalDao, UserStockOrderDao,
    ],
    exports: [
        UserDao, StockDao, StockHistoryDao, StockOrderDao, UserCapitalDao, UserStockDao,
        StockCapitalDao, UserStockOrderDao,
    ],
})
export class DaoModule { }
