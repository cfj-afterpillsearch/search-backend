import { Test } from '@nestjs/testing';
import { MongodbClientService } from './mongodb-client.service';

describe('MongodbClientService', () => {
  let service: MongodbClientService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [MongodbClientService],
    }).compile();

    service = module.get(MongodbClientService);
  });

  it('should be defined', () => {
    expect(service).toBeTruthy();
  });
});
