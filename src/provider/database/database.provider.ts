import { Sequelize } from 'sequelize-typescript';
import { User } from '../../entity/sequelize/user.entity';
import { ConstProvider } from '../../constant/provider.const';
import { Stock } from '../../entity/sequelize/stock.entity';
import { StockCapital } from '../../entity/sequelize/stock_capital.entity';
import { StockHistory } from '../../entity/sequelize/stock_history.entity';
import { StockOrder } from '../../entity/sequelize/stock_order.entity';
import { UserCapital } from '../../entity/sequelize/user_capital.entity';
import { UserStock } from '../../entity/sequelize/user_stock.entity';
import { ConfigService } from '../config/config.service';
import { UserStockOrder } from '../../entity/sequelize/user_stock_order.entity';

export const databaseProviders = [
    {
        provide: ConstProvider.SEQUELIZE,
        useFactory: async (config: ConfigService) => {
            const sequelize = new Sequelize(config.dbMysql);
            sequelize.addModels([
                User, Stock, StockCapital, StockHistory, StockOrder,
                UserCapital, UserStock, UserStockOrder,
            ]);
            // await sequelize.sync({ force: true });
            return sequelize;
        },
        inject: [ConfigService],
    },
];
