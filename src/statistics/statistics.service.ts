import { Inject, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { MONGODB_SEARCH_STATISTICS } from './statistics.constants';

@Injectable()
export class StatisticsService {
  constructor(
    @Inject(MONGODB_SEARCH_STATISTICS) private readonly ssService: Collection,
  ) {}
  async sendSearchLog(searchLog: any) {
    delete searchLog.latitude;
    delete searchLog.longitude;
    this.ssService.insertOne(searchLog);
  }
}
