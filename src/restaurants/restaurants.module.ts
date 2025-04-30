import { Module } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';
import { MapsModule } from 'src/common/services/maps/maps.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [MapsModule, AuthModule],
  controllers: [RestaurantsController],
  providers: [RestaurantsService],
})
export class RestaurantsModule {}
