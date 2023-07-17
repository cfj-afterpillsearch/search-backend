import { Module } from '@nestjs/common';
import { GoogleGeocodingService } from './google-geocoding.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [GoogleGeocodingService],
  exports: [GoogleGeocodingService],
})
export class GoogleGeocodingModule {}
