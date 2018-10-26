import {
  Entity,
  Index,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity
} from "typeorm";
import { v4 as uuid } from "uuid";
import { accountType } from "../enums/accountType.enum";

@Entity("users")
export class User extends BaseEntity {
  @PrimaryColumn("uuid")
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

  @Column("enum", { enum: accountType })
  accountType: accountType;

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

  @BeforeInsert()
  addId() {
    this.id = uuid();
  }
}
