import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './shared/global-exception.filter';
import { ResponseInterceptor } from './shared/response.interceptor';
const chalk = require('chalk');
import { server } from './config/server.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.TCP,
    options: {
      host: 'localhost',
      port: parseInt(server.port),
    },
  });
  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: false,
    }),
  );

  await app.listen();
  console.log(`Auth microservice is running on port ${server.port}`);
}

bootstrap().then(() => {
  console.log(
    chalk.whiteBright.italic.bold(
      `${chalk.bgGray(chalk.bgGreenBright.black.italic.bold('  AuthService is running on: '))} ${server.ip
      }:${server.port} => ${chalk.magenta(server.url)}\n`,
    ),
  );
});
