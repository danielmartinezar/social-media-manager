import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TransactionsModule } from './transactions/transactions.module';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/typeorm.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { MapsModule } from './common/services/maps/maps.module';

@Module({
  imports: [
    AuthModule,
    MapsModule,
    UsersModule,
    TransactionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    RestaurantsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
