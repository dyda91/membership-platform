import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Explicit environment-driven CORS origins. The development frontend origin
  // is preserved by default and production origins are configured through
  // CORS_ORIGINS. Server-to-server requests without an Origin header are kept
  // functional; unknown browser origins are rejected.
  const origins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin(
      origin: string | undefined,
      callback: (error: Error | null, allow?: boolean) => void,
    ) {
      if (!origin || origins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
  });

  // Focused security headers. CSP is left disabled so Vite, MinIO media and
  // inline dev resources keep working; a stricter CSP is a production decision.
  app.use(
    helmet({
      contentSecurityPolicy: false,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
