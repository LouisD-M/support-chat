import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

app.enableCors({
  origin: [
    "http://localhost:7001",
    "http://localhost:7002",
    "http://192.168.15.40:7001",
    "http://192.168.15.40:7002",

    // Application Tauri compilée sous Windows
    "http://tauri.localhost",
    "https://tauri.localhost",
  ],
});

  const port = Number(process.env.PORT ?? 7000);

  await app.listen(port, "0.0.0.0");

  console.log(
    `API disponible sur http://localhost:${port}`,
  );
}

void bootstrap();