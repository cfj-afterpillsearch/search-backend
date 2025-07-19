import { Module } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { MongodbClientService } from '../mongodb-client/mongodb-client.service';
import { Collection } from 'mongodb';
import { MONGODB_SEARCH_STATISTICS } from './statistics.constants';
import { MongodbClientModule } from '../mongodb-client/mongodb-client.module';

@Module({
  imports: [MongodbClientModule],
  providers: [
    StatisticsService,
    {
      provide: MONGODB_SEARCH_STATISTICS,
      useFactory: (mongodbClientService: MongodbClientService) => {
        const collectionName = process.env[
          'COLLECTION_NAME_SEARCH_STATISTICS'
        ] as string;
        const col = mongodbClientService
          .getMongoClient()
          .db()
          .collection<Collection>(collectionName);
        return col;
      },
      inject: [MongodbClientService],
    },
  ],
  exports: [StatisticsService],
})
export class StatisticsModule {}
