import {
  Entity,
  Index,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity,
  PrimaryGeneratedColumn
} from "typeorm";
import { AccountType } from "../enums/accountType.enum";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  externalGuid: string;

  @Index()
  @Column({ type: "varchar", length: 255 })
  firstName: string | undefined;

  @Index()
  @Column({ type: "varchar", length: 255 })
  lastName: string;

  @Index({ unique: true })
  @Column("varchar", { length: 255 })
  email: string;

  @Column("text")
  password: string;

  @Column("enum", { enum: AccountType })
  accountType: AccountType;

  @Column("boolean", { default: true })
  active: boolean;

  @Column("boolean", { default: false })
  accountLocked: boolean;

  @Column("boolean", { default: false })
  acceptedToS: boolean;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ type: "boolean", default: false })
  emailConfirmed: boolean;
}
