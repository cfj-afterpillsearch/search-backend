import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { MONGODB_PHARMACY } from './pharmacy.constants';
import { MongodbClientModule } from '../mongodb-client/mongodb-client.module';
import { MongodbClientService } from '../mongodb-client/mongodb-client.service';
import { PharmacyStoreModel } from './types';
import { Collection } from 'mongodb';

@Module({
  imports: [MongodbClientModule],
  providers: [
    PharmacyService,
    {
      provide: MONGODB_PHARMACY,
      useFactory: (mongodbClientService: MongodbClientService) => {
        const collectionName = process.env[
          'COLLECTION_NAME_PHARMACY'
        ] as string;
        const col = mongodbClientService
          .getMongoClient()
          .db()
          .collection<Collection<PharmacyStoreModel>>(collectionName);
        return col;
      },
      inject: [MongodbClientService],
    },
  ],
  exports: [PharmacyService],
})
export class PharmacyModule {}
