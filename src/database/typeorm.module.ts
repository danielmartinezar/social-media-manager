import { DataSource } from 'typeorm';
import { Global, Module } from '@nestjs/common';

@Global() // makes the module available globally for other modules once imported in the app modules
@Module({
  imports: [],
  providers: [
    {
      provide: DataSource, // add the datasource as a provider
      inject: [],
      useFactory: async () => {
        // using the factory function to create the datasource instance
        try {
          const dataSource = new DataSource({
            url: process.env.DB_URI_DEV,
            type: 'postgres',
            synchronize: true,
            entities: [`${__dirname}/../**/**.entity{.ts,.js}`],
            migrations: ['src/migration/**/*.ts'],
            logging: false,
          });
          await dataSource.initialize(); // initialize the data source
          console.info('Database connected successfully');
          return dataSource;
        } catch (error) {
          console.error('Error connecting to database');
          throw error;
        }
      },
    },
  ],
  exports: [DataSource],
})
export class DatabaseModule {}
