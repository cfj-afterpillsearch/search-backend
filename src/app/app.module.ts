import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleGeocodingModule } from '../google-geocoding/google-geocoding.module';
import { MedicalinstitutionModule } from '../medicalinstitution/medicalinstitution.module';
import { StatisticsModule } from '../statistics/statistics.module';
import { PharmacyModule } from '../pharmacy/pharmacy.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GoogleGeocodingModule,
    MedicalinstitutionModule,
    PharmacyModule,
    StatisticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
