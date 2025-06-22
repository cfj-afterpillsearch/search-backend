import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app/app.module';

describe('Pharmacy Search API (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/api/v1/search/current-location/pharmacies (GET)', () => {
    it('should return pharmacies for current location search', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/pharmacies')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
          page: 1,
          perpage: 10,
          is_out_of_hours: 0,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('meta');
          expect(res.body).toHaveProperty('links');
          expect(res.body).toHaveProperty('results');
          expect(res.body.meta).toHaveProperty(
            'searchType',
            'current-location',
          );
          expect(res.body.meta).toHaveProperty('latitude', 35.681236);
          expect(res.body.meta).toHaveProperty('longitude', 139.767125);
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });

    it('should return 400 when latitude is missing', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/pharmacies')
        .query({
          longitude: 139.767125,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(400);
    });

    it('should return 400 when longitude is missing', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/pharmacies')
        .query({
          latitude: 35.681236,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(400);
    });

    it('should handle pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/pharmacies')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
          page: 2,
          perpage: 5,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty('currentPage', 2);
          expect(res.body.meta).toHaveProperty('itemsPerPage', 5);
        });
    });

    it('should filter by out of hours service', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/pharmacies')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
          is_out_of_hours: 1,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200);
    });
  });

  describe('/api/v1/search/address/pharmacies (GET)', () => {
    it('should return pharmacies for address search with single todofuken', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: '東京都',
          shikuchoson: '町田市',
          page: 1,
          perpage: 10,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('meta');
          expect(res.body).toHaveProperty('links');
          expect(res.body).toHaveProperty('results');
          expect(res.body.meta).toHaveProperty('searchType', 'address');
          expect(res.body.meta).toHaveProperty('address_todofuken', '東京都');
          expect(res.body.meta).toHaveProperty('address_shikuchoson', '町田市');
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });

    it('should return pharmacies for address search with multiple todofuken', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: ['東京都', '神奈川県'],
          shikuchoson: '町田市',
          page: 1,
          perpage: 10,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty(
            'address_todofuken',
            '東京都,神奈川県',
          );
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });

    it('should return pharmacies for address search with multiple shikuchoson', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: '東京都',
          shikuchoson: ['町田市', '座間市'],
          page: 1,
          perpage: 10,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty(
            'address_shikuchoson',
            '町田市,座間市',
          );
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });

    it('should return pharmacies for address search with multiple todofuken and shikuchoson', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: ['東京都', '神奈川県'],
          shikuchoson: ['町田市', '座間市'],
          page: 1,
          perpage: 10,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty(
            'address_todofuken',
            '東京都,神奈川県',
          );
          expect(res.body.meta).toHaveProperty(
            'address_shikuchoson',
            '町田市,座間市',
          );
        });
    });

    it('should return 400 when todofuken is missing', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          shikuchoson: '町田市',
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(400);
    });

    it('should return 400 when todofuken is empty', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: '',
          shikuchoson: '町田市',
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(400);
    });

    it('should handle pagination correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: '東京都',
          shikuchoson: '町田市',
          page: 2,
          perpage: 5,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta).toHaveProperty('currentPage', 2);
          expect(res.body.meta).toHaveProperty('itemsPerPage', 5);
        });
    });

    it('should filter by out of hours service', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: '東京都',
          shikuchoson: '町田市',
          is_out_of_hours: 1,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200);
    });

    it('should handle URL encoding correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/pharmacies')
        .query({
          todofuken: '東京都',
          shikuchoson: '町田市',
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body.links.current).toContain(
            'todofuken=%E6%9D%B1%E4%BA%AC%E9%83%BD',
          );
          expect(res.body.links.current).toContain(
            'shikuchoson=%E7%94%BA%E7%94%B0%E5%B8%82',
          );
        });
    });
  });
});
