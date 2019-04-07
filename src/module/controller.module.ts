import { Module } from '@nestjs/common';
import { ServiceModule } from './service.module';
import { AuthController } from '../controller/auth.controller';

@Module({
    imports: [ServiceModule],
    controllers: [
        AuthController,
    ],
})
export class ControllerModule { }
