import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT) || 3000;

  const corsOrigin =
    process.env.NODE_ENV === 'production' ? 'https://afterpill.jp' : '*';

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET',
  });
  await app.listen(port, '0.0.0.0');
}
bootstrap();
