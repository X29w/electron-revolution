import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({
  name: "example",
})
export class ExampleEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column("text", {
    nullable: false,
    default: "",
  })
  username!: string;
}
