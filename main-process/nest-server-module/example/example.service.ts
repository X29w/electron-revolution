import { Injectable } from "@nestjs/common";
import { CreateExampleDto } from "./dto/create-example.dto";
import { UpdateExampleDto } from "./dto/update-example.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { ExampleEntity } from "./entities/example.entity";
import { Repository } from "typeorm";

@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(ExampleEntity)
    private readonly exampleRepository: Repository<ExampleEntity>
  ) {}

  async create(createExampleDto: CreateExampleDto) {
    const entity = this.exampleRepository.create(createExampleDto);
    const saved = await this.exampleRepository.save(entity);
    return {
      message: "This action adds a new example",
      data: saved,
    };
  }

  async findAll() {
    const data = await this.exampleRepository.find();
    return {
      message: "This action returns all examples",
      data,
    };
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
