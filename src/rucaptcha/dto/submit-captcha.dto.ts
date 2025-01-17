import { ApiProperty } from "@nestjs/swagger";
import { IsBase64, IsNotEmpty, IsString } from "class-validator";

export class CaptchaSubmitDto {
    @ApiProperty()
    @IsBase64()
    @IsNotEmpty()
    base64Image: string;
  }
  
  export class CaptchaValidateDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    captchaId: string;
  
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    solution: string;
  }
  