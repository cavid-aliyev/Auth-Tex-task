import {
    IsEmail,
    IsString,
    MinLength,
    Matches,
  } from "class-validator";
  import { ApiProperty } from "@nestjs/swagger";
  
  export class RegisterDto {
    @ApiProperty({
      description: "The email of user",
    })
    @IsEmail()
    email: string;
  
    @ApiProperty({
      description: "The password of user",
    })
    @IsString()
    @MinLength(8)
    @Matches(/^[A-Z](?=.*\d)(?=.*\W+).*$/, {
        message: "Password must start with an uppercase letter, contain at least one digit, and include a special character.",
      })      
      
    password: string;
  }
  