import { Module } from '@nestjs/common';
import { MedicalinstitutionService } from './medicalinstitution.service';
import { MongodbClientModule } from 'src/mongodb-client/mongodb-client.module';
import { MONGODB_MEDICALINSTITUTION } from './medicalinstitution.constants';
import { MongodbClientService } from '../mongodb-client/mongodb-client.service';
import { MedicalinstitutionStoreModel } from './types';
import { Collection } from 'mongodb';

@Module({
  imports: [MongodbClientModule],
  providers: [
    MedicalinstitutionService,
    {
      provide: MONGODB_MEDICALINSTITUTION,
      useFactory: (mongodbClientService: MongodbClientService) => {
        const collectionName = process.env[
          'COLLECTION_NAME_MEDICALINST'
        ] as string;
        const col = mongodbClientService
          .getMongoClient()
          .db()
          .collection<Collection<MedicalinstitutionStoreModel>>(collectionName);
        return col;
      },
      inject: [MongodbClientService],
    },
  ],
  exports: [MedicalinstitutionService],
})
export class MedicalinstitutionModule {}
