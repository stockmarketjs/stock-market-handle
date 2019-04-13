import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './middleware/logger.middleware';
import { ValidationPipe, Logger } from '@nestjs/common';
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { CronService } from './service/cron.service';
import { ConfigServiceStatic } from './provider/config/config.service';
import { OrderService } from './service/order.service';
import { Moment } from './common/util/moment';
import { ConstData } from './constant/data.const';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter(),
        { bodyParser: true },
    );

    app.use(logger);
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        forbidUnknownValues: true,
        transform: true,
        validationError: {
            target: false,
            value: false,
        },
    }));

    const cronService = app.get(CronService);
    await cronService.fire();

    const orderService = app.get(OrderService);
    const begin = Moment(ConstData.TRADE_PERIODS[0].begin, 'HH:mm');
    const end = Moment(ConstData.TRADE_PERIODS[1].end, 'HH:mm');
    const beginHm = Moment(begin).format('HHmm');
    const endHm = Moment(end).format('HHmm');
    const maxTryCount = 10;
    let currentTryCount = 0;
    while (1) {
        try {
            const currentHm = Moment().format('HHmm');
            if (Number(beginHm) <= Number(currentHm) && Number(currentHm) <= Number(endHm)) {
                await orderService.handle();
            }
            await sleep(3000);
            currentTryCount=0;
        } catch (e) {
            console.log(e);
            await sleep(10000);
            currentTryCount++;
            if(currentTryCount>maxTryCount){
                console.log('超过最大错误次数');
                process.exit();
            }
        }
    }
}
bootstrap();

async function sleep(time: number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
}
