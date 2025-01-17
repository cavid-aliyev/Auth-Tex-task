import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RuCaptchaService {
  private readonly apiKey: string;
  private readonly baseUrl = 'http://rucaptcha.com';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('RUCAPTCHA_API_KEY');
    if (!this.apiKey) {
      throw new Error('RUCAPTCHA_API_KEY is not defined in environment variables');
    }
  }

  async submitCaptcha(base64Image: string): Promise<number> {
    try {
      const formData = new FormData();
      formData.append('key', this.apiKey);
      formData.append('method', 'base64');
      formData.append('body', base64Image);
      formData.append('json', '1');

      

      const response = await axios.post<{ errorId: number; taskId: number }>("https://api.rucaptcha.com/createTask", {
        clientKey: this.apiKey,
        task: {
          type: "ImageToTextTask",
          body: base64Image
        }
      });

      if (response.data.errorId !== 0) {
        throw new HttpException(
          `RuCaptcha errors: ${response.data.errorId}`,
          HttpStatus.BAD_REQUEST
        );
      }

      return response.data.taskId;
    } catch (error) {
      throw new HttpException(
        `Capcha sending error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getCaptchaSolution(captchaId: string): Promise<string> {
      try {
        const response = await axios.get<{ status: number; request: string }>(`${this.baseUrl}/res.php`, {
          params: {
            key: this.apiKey,
            action: 'get',
            id: captchaId,
            json: 1
          }
        });
        
        console.log(response.data);

        if (response.data.status === 1) {
          return response.data.request;
        }

        if (response.data.request === 'CAPCHA_NOT_READY') {
          throw new HttpException(
            `RuCaptcha xətası: ${response.data.request}`,
            HttpStatus.BAD_REQUEST
          );
        }

    
      } catch (error) {
        throw new HttpException(
          `Captcha errors: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
  }

  async reportIncorrect(captchaId: string): Promise<void> {
    try {
      await axios.get(`${this.baseUrl}/res.php`, {
        params: {
          key: this.apiKey,
          action: 'reportbad',
          id: captchaId
        }
      });
    } catch (error) {
      throw new HttpException(
        `Səhv captcha bildirişi uğursuz oldu: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getBalance(): Promise<number> {
    try {
      const response = await axios.get<{ status: number; request: string }>(`${this.baseUrl}/res.php`, {
        params: {
          key: this.apiKey,
          action: 'getbalance',
          json: 1
        }
      });

      return parseFloat(response.data.request);
    } catch (error) {
      throw new HttpException(
        `Get balance errors: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}