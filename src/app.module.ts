import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { RuCaptchaModule } from './rucaptcha/rucaptcha.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),  
    DatabaseConfig,
    AuthModule,
    RuCaptchaModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
