import { IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: "The email of user",
  })
  @IsNotEmpty()
  @IsEmail({})
  email: string;

  @ApiProperty({
    description: "The password of user",
  })
  @IsNotEmpty()
  password: string;
}

export class LoginWithCaptchaDto extends LoginDto {
  @ApiProperty({  description: "The captcha id" })
  @IsOptional()
  @IsString()
  captchaId?: string;

  @ApiProperty({  description: "The captcha solution" })
  @IsOptional()
  @IsString()
  captchaSolution?: string;
}
