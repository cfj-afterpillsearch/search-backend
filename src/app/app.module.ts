import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GoogleGeocodingModule } from '../google-geocoding/google-geocoding.module';
import { MedicalinstitutionModule } from 'src/medicalinstitution/medicalinstitution.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GoogleGeocodingModule,
    MedicalinstitutionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
