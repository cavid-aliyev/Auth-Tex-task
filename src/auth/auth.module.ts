import { Logger, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/auth.entity";
import { JwtService } from "@nestjs/jwt";
import { RuCaptchaService } from "src/rucaptcha/rucaptcha.service";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [AuthService,Logger,JwtService,RuCaptchaService],
})
export class AuthModule {}
