import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  );

  const config = new DocumentBuilder()
    .setTitle('Draft SaaS API')
    .setDescription('Multi-tenant CRM — REST API')
    .setVersion('1.0')
    .addTag('auth',      'Аутентификация и сессия')
    .addTag('companies', 'Управление компаниями (тенантами)')
    .addTag('clients',   'Клиенты компании')
    .addTag('leads',     'Лиды (воронка продаж)')
    .addTag('tasks',     'Задачи')
    .addTag('users',     'Пользователи компании')
    // Имя схемы по умолчанию — 'JWT' (должно совпадать с @ApiBearerAuth() без аргумента)
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description:
        'После POST /auth/login скопируйте accessToken и вставьте сюда (без слова Bearer).',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    jsonDocumentUrl: 'api/json',
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // Разрешаем запросы с фронтенда
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});
