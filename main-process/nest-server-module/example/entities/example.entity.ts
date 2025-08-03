import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ExampleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;
}
