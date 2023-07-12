import { Inject, Injectable } from '@nestjs/common';
import { MONGODB_CLIENT } from './mongodb-client.constants';
import { MongoClient } from 'mongodb';

@Injectable()
export class MongodbClientService {
  constructor(
    @Inject(MONGODB_CLIENT) private readonly mongoClient: MongoClient,
  ) {}

  getMongoClient(): MongoClient {
    return this.mongoClient;
  }
}
