import { Inject, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { MONGODB_SEARCH_STATISTICS } from './statistics.constants';

@Injectable()
export class StatisticsService {
  constructor(
    @Inject(MONGODB_SEARCH_STATISTICS) private readonly ssService: Collection,
  ) {}
  async sendSearchKeyword(searchResultMeta: any) {
    delete searchResultMeta.latitude;
    delete searchResultMeta.longitude;
    this.ssService.insertOne({
      ...searchResultMeta,
      createdAt: new Date().toISOString(),
    });
  }
}
