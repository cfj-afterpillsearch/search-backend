import { Inject, Module } from '@nestjs/common';
import { MongodbClientService } from './mongodb-client.service';
import { MONGODB_CLIENT } from './mongodb-client.constants';
import { MongoClient } from 'mongodb';

@Module({
  providers: [
    MongodbClientService,
    {
      provide: MONGODB_CLIENT,
      useFactory: () => {
        const DATABASE_USER = process.env['MONGODB_USER'];
        const DATABASE_PASSWORD = process.env['MONGODB_PASSWORD'];
        const DATABASE_HOST = process.env['MONGODB_HOST'];
        const DATABASE_DBNAME = process.env['MONGODB_DBNAME'];

        const databaseURL = `mongodb+srv://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}/${DATABASE_DBNAME}?retryWrites=true&w=majority`;
        return new MongoClient(databaseURL);
      },
    },
  ],
  exports: [MongodbClientService],
})
export class MongodbClientModule {
  constructor(@Inject(MONGODB_CLIENT) private readonly dbClient: MongoClient) {}

  async onModuleDestroy() {
    await this.dbClient.close();
  }
}
