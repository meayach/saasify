import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  async getHello(): Promise<string> {
    return 'Hello World! SaaS Platform API is running.';
  }

  async getHealth(): Promise<object> {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'SaaS Platform API',
      version: '1.0.0',
    };
  }
}
