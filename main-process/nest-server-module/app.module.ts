import "reflect-metadata";
import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";
import { ExampleEntity } from "./example/entities/example.entity";
import { ExampleModule } from "./example/example.module";
import { ROOT_ENTRY_PATH } from "@main/constant/config";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: join(ROOT_ENTRY_PATH, "data-base", "dev.db"),
      entities: [ExampleEntity],
      synchronize: true,
    }),
    ExampleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
