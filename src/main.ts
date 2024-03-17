import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.enableCors();

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Email Api')
    .setDescription('Tecnologias: Nestjs, Swagger, TypeOrm, Postgres e Docker')
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  await app.listen(process.env.APP_PORT || 3000, () =>
    console.log(
      `App is Running\nDocumentation available on http://localhost:${process.env.APP_PORT}/docs`,
    ),
  );
}
bootstrap();
