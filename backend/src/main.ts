import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  // app.use(bodyParser.json({ limit: '10mb' }));

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://socialyze-frontend.netlify.app',
      'https://staging-socialyze.netlify.app',
    ],
    credentials: true,
    allowedHeaders: 'Content-Type, Authorization, Set-Cookie',
    exposedHeaders: 'Set-Cookie',
  });

  await app.listen(3000);
}
bootstrap();
