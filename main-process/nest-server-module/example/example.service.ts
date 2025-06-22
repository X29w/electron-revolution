import { Inject, Injectable } from "@nestjs/common";
import { CreateExampleDto } from "./dto/create-example.dto";
import { UpdateExampleDto } from "./dto/update-example.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class ExampleService {
  @Inject()
  private readonly prisma: PrismaService;

  create(createExampleDto: CreateExampleDto) {
    return "This action adds a new example";
  }

  async findAll() {
    return await this.prisma.example.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} example`;
  }

  update(id: number, updateExampleDto: UpdateExampleDto) {
    return `This action updates a #${id} example`;
  }

  remove(id: number) {
    return `This action removes a #${id} example`;
  }
}
