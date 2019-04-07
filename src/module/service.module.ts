import { Module } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { DaoModule } from './dao.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { StockService } from '../service/stock.service';
import { UserCapitalService } from '../service/user_capital.service';
import { UserStockService } from '../service/user_stock.service';
import { StockHistoryService } from '../service/stock_history.service';
import { StockOrderService } from '../service/stock_order.service';
import { UserStockOrderService } from '../service/user_stock_order.service';
import { OrderService } from '../service/order.service';
import { ConfigModule } from '../provider/config/config.module';
import { CronService } from '../service/cron.service';
import { UserService } from '../service/user.service';
import { JwtStrategy } from '../common/passport/jwt.strategy';
import { RobotService } from '../service/robot.service';
import { StockSummaryService } from '../service/stock_summary.service';

@Module({
    imports: [
        DaoModule,
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
            secretOrPrivateKey: 'hui8sdYDGSYGD87td87gYusgduyasg6TS^D&dyggdsuadg23137&^^$2h',
            signOptions: {
                expiresIn: '2d',
            },
        }),
        ConfigModule,
    ],
    providers: [
        AuthService, JwtStrategy,
        StockService, UserCapitalService, UserStockService, StockHistoryService,
        StockOrderService, UserStockOrderService, OrderService,
        CronService, UserService, RobotService, StockSummaryService,
    ],
    exports: [
        AuthService, PassportModule,
        StockService, UserCapitalService, UserStockService, StockHistoryService,
        StockOrderService, UserStockOrderService,
        CronService, UserService, StockSummaryService,
    ],
})
export class ServiceModule { }
