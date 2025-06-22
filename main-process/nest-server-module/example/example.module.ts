import "reflect-metadata";
import { Module } from "@nestjs/common";
import { ExampleService } from "./example.service";
import { ExampleController } from "./example.controller";
import { PrismaService } from "../prisma/prisma.service";

@Module({
  controllers: [ExampleController],
  providers: [ExampleService, PrismaService],
})
export class ExampleModule {}
