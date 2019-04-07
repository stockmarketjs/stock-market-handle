import { Module } from '@nestjs/common';
import { ControllerModule } from './module/controller.module';

@Module({
  imports: [ControllerModule],
})
export class AppModule { }
