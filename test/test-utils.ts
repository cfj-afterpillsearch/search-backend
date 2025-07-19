import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

export interface TestResponse {
  meta: {
    itemsPerPage: number;
    totalItems: number;
    currentPage: number;
    totalPages: number;
    searchType: string;
    latitude?: number;
    longitude?: number;
    address_todofuken?: string;
    address_shikuchoson?: string;
  };
  links: {
    current: string;
    first: string;
    prev: string | null;
    next: string | null;
    last: string;
  };
  results: any[];
}

export const createTestApp = async (): Promise<INestApplication> => {
  const { Test, TestingModule } = await import('@nestjs/testing');
  const { AppModule } = await import('../src/app/app.module');

  const moduleFixture = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
};

export const makeRequest = (
  app: INestApplication,
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  query?: any,
  headers?: any,
) => {
  let req = request(app.getHttpServer())[method](url);
  if (query) {
    req = req.query(query);
  }
  if (headers) {
    req = req.set(headers);
  }
  return req;
};

export const validatePaginationResponse = (response: TestResponse) => {
  expect(response.meta).toHaveProperty('itemsPerPage');
  expect(response.meta).toHaveProperty('totalItems');
  expect(response.meta).toHaveProperty('currentPage');
  expect(response.meta).toHaveProperty('totalPages');
  expect(response.meta).toHaveProperty('searchType');
  expect(response.links).toHaveProperty('current');
  expect(response.links).toHaveProperty('first');
  expect(response.links).toHaveProperty('prev');
  expect(response.links).toHaveProperty('next');
  expect(response.links).toHaveProperty('last');
  expect(Array.isArray(response.results)).toBe(true);
};

export const validateCurrentLocationResponse = (response: TestResponse) => {
  validatePaginationResponse(response);
  expect(response.meta).toHaveProperty('latitude');
  expect(response.meta).toHaveProperty('longitude');
  expect(response.meta.searchType).toBe('current-location');
};

export const validateAddressResponse = (response: TestResponse) => {
  validatePaginationResponse(response);
  expect(response.meta).toHaveProperty('address_todofuken');
  expect(response.meta).toHaveProperty('address_shikuchoson');
  expect(response.meta.searchType).toBe('address');
};

export const TEST_COORDINATES = {
  latitude: 35.681236,
  longitude: 139.767125,
};

export const TEST_ADDRESS = {
  todofuken: '東京都',
  shikuchoson: '町田市',
};

export const TEST_API_KEY = 'pillnyaaan-dev';
