import { DataSource, DataSourceOptions } from "typeorm";

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'ETechValet',
  entities: [
    'src/**/*.model.ts',
    '!src/**/base.model.ts', 
  ],
  migrations: ['src/shared/infrastructure/data/migrations/*.ts'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;