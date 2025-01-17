  import { Controller, Post, Get, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
  import { Express } from 'express';
  import { RuCaptchaService } from './rucaptcha.service';
  import { ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { CaptchaValidateDto } from './dto/submit-captcha.dto';

  @Controller('captcha')
  @ApiTags('captcha')
  export class RuCaptchaController {
    constructor(private readonly ruCaptchaService: RuCaptchaService) {}

    
    @Post('submit')
    @UseInterceptors(FileInterceptor('image', {
      limits: {
        fileSize: 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpg|jpeg|png|svg)$/)) {
          cb(new Error('Yalnız JPG və PNG şəkillər qəbul edilir'), false);
        }
        cb(null, true);
      }
    }))
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: { 
        type: 'object',
        properties: {
          image: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    })
    async submitCaptcha(@UploadedFile() file: Express.Multer.File) {
      const base64Image = file.buffer.toString('base64');
      const captchaId = await this.ruCaptchaService.submitCaptcha(base64Image);
      return { captchaId };
    }

  
    @Post('validate')
    @ApiBody({ type: CaptchaValidateDto })
    @ApiOperation({ summary: 'Validate captcha solution' })
    @ApiResponse({ status: 200, description: 'Returns validation result' })
    async validateCaptcha(@Body() dto: CaptchaValidateDto) {
      const solution = await this.ruCaptchaService.getCaptchaSolution(dto.captchaId);
      const isValid = solution === dto.solution;
      
      if (!isValid) {
        await this.ruCaptchaService.reportIncorrect(dto.captchaId);
      }

      return { isValid };
    }

    @Get('solution/:id')
    async getCaptchaSolution(@Param('id') captchaId: string) {
      const solution = await this.ruCaptchaService.getCaptchaSolution(captchaId);
      return { solution };
    }

    @Post('report/:id')
    async reportIncorrect(@Param('id') captchaId: string) {
      await this.ruCaptchaService.reportIncorrect(captchaId);
      return { message: 'Report submitted successfully' };
    }

    @Get('balance')
    async getBalance() {
      const balance = await this.ruCaptchaService.getBalance();
      return { balance };
    }
  }