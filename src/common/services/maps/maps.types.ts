export interface NearbyRestaurantDto {
  id: number;
  name: string;
  cuisine: string;
  lat: number;
  lon: number;
}

export interface FindNearbyParams {
  city?: string;
  lat?: number;
  lon?: number;
  radius?: number;
}
