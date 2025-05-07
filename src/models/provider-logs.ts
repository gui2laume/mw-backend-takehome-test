import { Column, PrimaryGeneratedColumn } from 'typeorm';

export class ProviderLogs {
  @PrimaryGeneratedColumn('rowid')
  id: string;
  @Column()
  date: Date;
  @Column()
  url: string;
  @Column()
  status: number;
  @Column()
  message: string;
  @Column()
  duration: number;
}