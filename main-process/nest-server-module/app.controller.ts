import { Controller, Get, Inject } from "@nestjs/common";
import "reflect-metadata";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  @Inject()
  private readonly appService: AppService;

  @Get()
  getHello(): string {
    console.log("response from app controller");
    return this.appService.getHello();
  }
}
