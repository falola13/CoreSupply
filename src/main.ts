import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1');

  app.useStaticAssets(join(process.cwd(), 'public'));

  // Set Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Enable Swagger docs
  const config = new DocumentBuilder()
    .setTitle('CoreSupply API Documentation')
    .setDescription('API documentation for the application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication related endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Refresh-JWT',
        description: 'Enter refresh JWT token',
        in: 'header',
      },
      'JWT-refresh',
    )
    .addTag('users', 'User management endpoints')
    .addTag('products', 'Product management endpoints')
    .addTag('cart', 'Carts management endpoints')
    .addServer('http://localhost:3001', 'Development server')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'CoreSupply API',
    customfavIcon:
      'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPCFET0NUWVBFIHN2ZyBQVUJMSUMgIi0vL1czQy8vRFREIFNWRyAxLjEvL0VOIiAiaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkIj4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSIwLjI2OTc1MmluIiBoZWlnaHQ9IjAuMzA5Nzk1aW4iIHZlcnNpb249IjEuMSIgc3R5bGU9InNoYXBlLXJlbmRlcmluZzpnZW9tZXRyaWNQcmVjaXNpb247IHRleHQtcmVuZGVyaW5nOmdlb21ldHJpY1ByZWNpc2lvbjsgaW1hZ2UtcmVuZGVyaW5nOm9wdGltaXplUXVhbGl0eTsgZmlsbC1ydWxlOmV2ZW5vZGQ7IGNsaXAtcnVsZTpldmVub2RkIiB2aWV3Qm94PSIwIDAgMTYuNzUgMTkuMjQiIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4bWxuczp4b2RtPSJodHRwOi8vd3d3LmNvcmVsLmNvbS9jb3JlbGRyYXcvb2RtLzIwMDMiPgogPGRlZnM+CiAgPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KICAgPCFbQ0RBVEFbCiAgICAuZmlsMCB7ZmlsbDojMDIyNTVGfQogICAgLmZpbDEge2ZpbGw6I0YxNUQwQX0KICAgXV0+CiAgPC9zdHlsZT4KIDwvZGVmcz4KIDxnIGlkPSJMYXllcl94MDAyMF8xIj4KICA8bWV0YWRhdGEgaWQ9IkNvcmVsQ29ycElEXzBDb3JlbC1MYXllciIvPgogIDxnIGlkPSJfMjI4ODYwODg5MDc1MiI+CiAgIDxwYXRoIGNsYXNzPSJmaWwwIiBkPSJNLTAgNC43N2wwIDkuNGMtMCwwLjQ3IDAuMDMsMC4zIDAuODcsMC44bDcuNTIgNC4yN2MwLjM0LC0wLjEzIDAuNzMsLTAuNDEgMS4wNSwtMC42IDEuMDQsLTAuNjEgMi4wNSwtMS4xMiAzLjE0LC0xLjc4IDAuNjYsLTAuMzkgMS4zOCwtMC43NyAyLjA4LC0xLjE3bDIuMDggLTEuMjEgLTAgLTkuMTFjLTAsLTAuNTQgMC4wNiwtMC41NSAtMC4xOSwtMC42OWwtMy4zIC0xLjkyYy0xLjQ3LC0wLjg4IC0yLjk5LC0xLjY4IC00LjQxLC0yLjUyIC0wLjE3LC0wLjEgLTAuMzgsLTAuMjggLTAuNTUsLTAuMjNsLTMuODcgMi4yMmMtMC43NiwwLjQ0IC0xLjQ5LDAuODYgLTIuMjEsMS4yNiAtMC43NiwwLjQyIC0xLjQyLDAuODcgLTIuMjIsMS4yOHptMi4zOSAxLjRsLTAgNi45NiAyLjk5IDEuN2MwLjMxLDAuMTggMi45MiwxLjY5IDMuMDIsMS42OSAwLjE1LDAgNS45MSwtMy4zOSA1Ljk2LC0zLjQybDAuMDEgLTYuOTJjLTAuMiwtMC4xOSAtNS45NiwtMy40NCAtNS45NywtMy40NCAtMC4wMSwtMCAtNS41NCwzLjEyIC02LDMuNDR6Ii8+CiAgIDxwYXRoIGNsYXNzPSJmaWwxIiBkPSJNMy42MiA2LjgybC0wIDUuNmMwLjIyLDAuMTggNC43MywyLjc0IDQuNzcsMi43NCAwLjE0LDAuMDEgMS4wMywtMC41NSAxLjIsLTAuNjUgMC40NywtMC4yNiAzLjMyLC0xLjg5IDMuNTQsLTIuMDlsLTAgLTAuM2MtMC4xNSwtMC4xMSAtMi4xMiwtMS4yNCAtMi4yLC0xLjIyIC0wLjE4LDAuMDkgLTAuMzYsMC4yOCAtMC41NiwwLjQxIC0wLjIyLDAuMTUgLTAuMzgsMC4yNCAtMC41OSwwLjM3IC0xLjYxLDAuOTQgLTEuMDUsMC45NyAtMi40NCwwLjE2IC0wLjI3LC0wLjE2IC0xLC0wLjU0IC0xLjE5LC0wLjcxbC0wLjAxIC0zIDIuMjkgLTEuMzRjMC4xLC0wIDIuMDIsMS4xNSAyLjIzLDEuMzMgMC4xMSwwLjA5IDAuMTgsMC4xOSAwLjI4LDAuMjZsMi4yIC0xLjI1IDAuMDIgLTAuMzNjLTAuNDMsLTAuMjkgLTQuNTcsLTIuNzIgLTQuNzUsLTIuN2MtMC4wOSwwLjAxIC00LjM4LDIuNTEgLTQuNzcsMi43NHoiLz4KICA8L2c+CiA8L2c+Cjwvc3ZnPg==',
    customCss: `
  .swagger-ui .topbar { display: none }
  .swagger-ui .info .title::before {
    content: "";
    display: block;
    width: 100px;
    height: 100px;
    background: url('/Core-C.svg') no-repeat center;
    background-size: contain;
    margin-bottom: 20px;
  }
  .swagger-ui .info { margin: 50px 0; }
`,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((error) => {
  Logger.error('Error starting server', error);
  process.exit(1);
});
