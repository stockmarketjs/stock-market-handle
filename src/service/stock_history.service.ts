import { Injectable, UnauthorizedException, NotFoundException, Inject, BadRequestException } from '@nestjs/common';
import { BaseService } from './base.service';
import { Transaction, Op } from 'sequelize';
import * as _ from 'lodash';
import { StockHistoryDao } from '../dao/stock_history.dao';
import { Moment } from '../common/util/moment';
import { StockHistoryCreateBodyDto } from '../dto/stock/stock_history.dto';

@Injectable()
export class StockHistoryService extends BaseService {

    constructor(
        private readonly stockHistoryDao: StockHistoryDao,
    ) {
        super();
    }

    public async create(
        paarms: StockHistoryCreateBodyDto,
        transaction?: Transaction,
    ) {
        return this.stockHistoryDao.create(paarms, { transaction });
    }

    public async findAllByPeriod(stockId: string, begin?: string, end?: string) {
        return this.stockHistoryDao.findAll({
            where: {
                stockId,
                date: {
                    [Op.lte]: Moment(end).format('YYYY-MM-DD'),
                    [Op.gte]: Moment(begin).format('YYYY-MM-DD'),
                },
            },
            order: [['date', 'ASC']],
        });
    }

}
