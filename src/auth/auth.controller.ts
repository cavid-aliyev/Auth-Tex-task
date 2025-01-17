import {
    Controller,
    Post,
    Body,
    Get,
    Query,
  } from "@nestjs/common";
  import { AuthService } from "./auth.service";
  import {
    RegisterDto,
  } from "./dto";
  import {  ApiBody, ApiTags } from "@nestjs/swagger";
  import {  RegisterResponse } from "./types/";
import { LoginDto, LoginWithCaptchaDto } from "./dto/login.dto";
import { LoginResponse } from "./types/login-response";
  
  @Controller("auth")
  @ApiTags("auth")
  export class AuthController {
    constructor(private readonly authService: AuthService) {}
  
    @Post("/register")
    @ApiBody({ type: RegisterDto })
    register(@Body() dto: RegisterDto): Promise<RegisterResponse> {
      return this.authService.register(dto);
    }

    @Get('captcha-required')
    async checkCaptchaRequired(@Query('email') email: string) {
      const required = await this.authService.isCaptchaRequired(email);
      return { captchaRequired: required };
    }
  
    @Post('login')
    async login(@Body() dto: LoginWithCaptchaDto): Promise<LoginResponse> {
      return this.authService.login(dto);
    }
  }
  