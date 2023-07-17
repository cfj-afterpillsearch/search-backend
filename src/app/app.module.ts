import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { GoogleGeocodingModule } from '../google-geocoding/google-geocoding.module';
import { MedicalinstitutionModule } from 'src/medicalinstitution/medicalinstitution.module';
import { StatisticsModule } from 'src/statistics/statistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GoogleGeocodingModule,
    MedicalinstitutionModule,
    StatisticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
