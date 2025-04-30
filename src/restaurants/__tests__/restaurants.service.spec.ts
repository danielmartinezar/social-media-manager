import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsService } from '../restaurants.service';
import { MapsService } from '../../common/services/maps/maps.service';
import { NearbyRestaurantDto } from '../../common/services/maps/maps.types';

const mockMapsService = {
  findNearbyRestaurants: jest.fn(),
};

describe('RestaurantsService', () => {
  let service: RestaurantsService;

  const restaurantsSample: NearbyRestaurantDto[] = Array.from({
    length: 15,
  }).map((_, idx) => ({
    id: idx + 1,
    name: `R${idx + 1}`,
    cuisine: 'fusion',
    lat: 1,
    lon: 1,
  }));

  beforeEach(async () => {
    mockMapsService.findNearbyRestaurants.mockResolvedValue(restaurantsSample);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RestaurantsService,
        { provide: MapsService, useValue: mockMapsService },
      ],
    }).compile();

    service = module.get<RestaurantsService>(RestaurantsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findNearbyRestaurantsByUserLocation', () => {
    it('should paginate and return meta', async () => {
      const page = 2;
      const pageSize = 5;
      const { data, meta } = await service.findNearbyRestaurantsByUserLocation(
        undefined,
        undefined,
        'Bogotá',
        page,
        pageSize,
      );

      expect(mockMapsService.findNearbyRestaurants).toHaveBeenCalledWith({
        city: 'Bogotá',
        lat: undefined,
        lon: undefined,
      });

      expect(data).toHaveLength(pageSize);
      expect(meta).toEqual({
        totalItems: restaurantsSample.length,
        pageSize,
        totalPages: Math.ceil(restaurantsSample.length / pageSize),
        currentPage: page,
      });
    });
  });
});
