import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RuCaptchaService } from './rucaptcha.service';
import { RuCaptchaController } from './rucaptcha.controller';

@Module({
  imports: [ConfigModule],
  controllers: [RuCaptchaController],
  providers: [RuCaptchaService],
  exports: [RuCaptchaService]
})
export class RuCaptchaModule {}