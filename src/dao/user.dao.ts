import { Injectable } from '@nestjs/common';
import { BaseDao } from './base.dao';
import { FindOptions } from 'sequelize';
import { User } from '../entity/sequelize/user.entity';

@Injectable()
export class UserDao extends BaseDao<User> {

    protected readonly entity = User;

    public async findOneScopeAll(option: FindOptions) {
        return this.sequelize.getRepository(this.entity).scope('all').findOne(option);
    }

}