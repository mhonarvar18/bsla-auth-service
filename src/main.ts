import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/global-exception.filter';
import { ResponseInterceptor } from './shared/response.interceptor';
const chalk = require('chalk');
import { server } from './config/server.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  app.setGlobalPrefix('api/v1');
  app.enableCors();

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().then(() => {
  console.log(
    chalk.whiteBright.italic.bold(
      `${chalk.bgGray(chalk.bgGreenBright.black.italic.bold('  TelegramBot is running on: '))} ${server.ip
      }:${server.port} => ${chalk.magenta(server.url)}\n`,
    ),
  );
});
