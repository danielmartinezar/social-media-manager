import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env` });

export const AppDataSourceFactory = (): DataSource => {
  const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    url: process.env.DB_URI_DEV,
    entities: [`${__dirname}/../**/**.entity{.ts,.js}`],
    migrations: ['src/database/migrations/**/*.ts'],
    synchronize: false,
    logging: true,
    schema: 'public',
  };

  return new DataSource(dataSourceOptions);
};

const dataSource = AppDataSourceFactory();
export default dataSource;
