import { PrimaryGeneratedColumn } from "typeorm";

export abstract class BaseModel<TPrimaryKey> {
  @PrimaryGeneratedColumn()
  id: TPrimaryKey;
}