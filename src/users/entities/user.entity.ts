import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true, nullable: false, length: 200, type: 'varchar' })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'varchar', length: 64 })
  confirmationToken?: string;

  @Column({ nullable: true, type: 'varchar', length: 64 })
  recoverToken?: string;

  @Column({ default: 'user', type: 'varchar' })
  role?: string;

  @Column({ default: true, type: 'boolean' })
  status?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;
}
