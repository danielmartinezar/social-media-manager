import { Controller, Get, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createApiResponse } from '../common/utils/response.utils';
import { NearbyRestaurantDto } from 'src/common/services/maps/maps.types';
import { MetaData } from 'src/common/api.type';

@Controller('restaurants')
@UseGuards(JwtAuthGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  @Get('nearby')
  async findNearby(
    @Query('city') city?: string,
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
    @Query('currentPage') currentPage?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    let result: { data: NearbyRestaurantDto[]; meta: MetaData };
    const page = currentPage ? parseInt(currentPage, 10) : 1;
    const size = pageSize ? parseInt(pageSize, 10) : 10;
    if (city) {
      result =
        await this.restaurantsService.findNearbyRestaurantsByUserLocation(
          undefined,
          undefined,
          city,
          page,
          size,
        );
    } else {
      const latitude = lat ? parseFloat(lat) : undefined;
      const longitude = lon ? parseFloat(lon) : undefined;
      result =
        await this.restaurantsService.findNearbyRestaurantsByUserLocation(
          latitude,
          longitude,
          undefined,
          page,
          size,
        );
    }

    return createApiResponse({
      statusCode: HttpStatus.OK,
      message: 'Nearby restaurants fetched successfully',
      data: result.data,
      meta: result.meta,
    });
  }
}
