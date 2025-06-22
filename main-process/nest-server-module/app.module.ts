import "reflect-metadata";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { ExampleModule } from "./example/example.module";

@Module({
  imports: [PrismaModule, ExampleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
