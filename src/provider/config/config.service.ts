import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { SequelizeOptions } from 'sequelize-typescript';

export class ConfigService {

    private readonly envConfig: { [key: string]: string };

    constructor() {
        this.envConfig = process.env.SERVER_PORT ? process.env as { [key: string]: string } :
            dotenv.parse(fs.readFileSync(path.resolve(`${process.cwd()}/config`, 'default.env')));
    }

    get(key: string): string {
        return this.envConfig[key];
    }

    get port(): number {
        return Number(this.envConfig.SERVER_PORT);
    }

    get privateKey(): string {
        return this.envConfig.SECURITY_PRIVATE_KEY;
    }

    get dbMysql(): SequelizeOptions {
        return {
            dialect: 'mysql',
            host: this.envConfig.DB_MYSQL_HOST,
            port: Number(this.envConfig.DB_MYSQL_PORT),
            username: this.envConfig.DB_MYSQL_USERNAME,
            password: this.envConfig.DB_MYSQL_PASSWORD,
            database: this.envConfig.DB_MYSQL_DATABASE,
            logging: false,
            timezone: '+08:00',
        };
    }

}

export const ConfigServiceStatic = new ConfigService();