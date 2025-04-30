// src/openstreetmap/openstreetmap.module.ts
import { Module } from '@nestjs/common';
import { MapsService } from './maps.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
