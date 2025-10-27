import { Partner } from '../../../../partners/domain/models/partner';
import { DataSource } from 'typeorm';

export default new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'root',
  database: 'ETechValet',
  entities: [Partner],
  migrations: ['src/shared/infrastructure/data/migrations/*.ts'],
});
