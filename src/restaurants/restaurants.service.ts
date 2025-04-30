// src/restaurants/restaurants.service.ts

import { Injectable } from '@nestjs/common';
import { MapsService } from '../common/services/maps/maps.service';

@Injectable()
export class RestaurantsService {
  constructor(private readonly mapsService: MapsService) {}

  /**
   * Fetch restaurants near the given coordinates by delegating
   * to the MapsService.
   *
   * @param lat Latitude of the user location
   * @param lon Longitude of the user location
   * @returns Promise resolving to an array of NearbyRestaurantDto
   */
  async findNearbyRestaurantsByUserLocation(
    lat?: number,
    lon?: number,
    city?: string,
    currentPage: number = 1,
    pageSize: number = 10,
  ) {
    const data = await this.mapsService.findNearbyRestaurants({
      city: city,
      lat: lat,
      lon: lon,
    });
    const totalItems = data.length;
    const start = (currentPage - 1) * pageSize;
    const paginated = data.slice(start, start + pageSize);
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      data: paginated,
      meta: { totalItems, pageSize, totalPages, currentPage },
    };
  }
}
