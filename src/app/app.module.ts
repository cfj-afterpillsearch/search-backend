import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongodbModule } from '../mongodb/mongodb.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleGeocodingModule } from '../google-geocoding/google-geocoding.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongodbModule,
    GoogleGeocodingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
