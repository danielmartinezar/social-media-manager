import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantsController } from '../restaurants.controller';
import { RestaurantsService } from '../restaurants.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ExecutionContext } from '@nestjs/common';
import { NearbyRestaurantDto } from '../../common/services/maps/maps.types';

const mockRestaurantsService = {
  findNearbyRestaurantsByUserLocation: jest.fn(),
};

// Allow all requests through the guard for testing
class MockJwtAuthGuard {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canActivate(_context: ExecutionContext): boolean {
    return true;
  }
}

describe('RestaurantsController', () => {
  let controller: RestaurantsController;

  const sampleData: NearbyRestaurantDto[] = [
    { id: 1, name: 'A', cuisine: 'italian', lat: 1, lon: 1 },
  ];
  const sampleMeta = {
    totalItems: 1,
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
  };

  beforeEach(async () => {
    mockRestaurantsService.findNearbyRestaurantsByUserLocation.mockResolvedValue(
      {
        data: sampleData,
        meta: sampleMeta,
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RestaurantsController],
      providers: [
        { provide: RestaurantsService, useValue: mockRestaurantsService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(MockJwtAuthGuard)
      .compile();

    controller = module.get<RestaurantsController>(RestaurantsController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service with city param and return api response', async () => {
    const res = await controller.findNearby(
      'Bogotá',
      undefined,
      undefined,
      '1',
      '10',
    );
    expect(
      mockRestaurantsService.findNearbyRestaurantsByUserLocation,
    ).toHaveBeenCalledWith(undefined, undefined, 'Bogotá', 1, 10);
    expect(res.response.body.data).toEqual(sampleData);
  });

  it('should call service with coordinates', async () => {
    const res = await controller.findNearby(
      undefined,
      '4.6',
      '-74.1',
      '1',
      '10',
    );
    expect(
      mockRestaurantsService.findNearbyRestaurantsByUserLocation,
    ).toHaveBeenCalledWith(4.6, -74.1, undefined, 1, 10);
    expect(res.response.body.meta).toEqual(sampleMeta);
  });
});
