import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import chalk from "chalk";

async function bootstrap() {
  // -- setup app
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  app.setGlobalPrefix("api");
  app.disable("x-powered-by");
  app.set("trust proxy", true);

  // -- setup swagger
  setupSwagger(app);

  await app.listen(3000);
}

async function setupSwagger(app: NestExpressApplication) {
  if (process.env.NODE_ENV === "development") {
    const config = new DocumentBuilder()
      .setTitle("TerraCapital")
      .setDescription("Welcome to the API documentation.")
      .setVersion("1.0")
      .addServer("http://localhost", "Local development server")
      .addServer("https://terra-capital.fr", "Production server")
      .addBearerAuth(
        { type: "http", scheme: "bearer", bearerFormat: "JWT" },
        "access-token"
      )
      .build();
    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup("swagger", app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: "alpha",
        operationsSorter: "alpha",
      },
      jsonDocumentUrl: "/swagger/json",
    });

    console.log(
      `${chalk.green("[Swagger] is running on")} ${chalk.yellow(
        "http://localhost/swagger"
      )}`
    );
  }
}

bootstrap();
