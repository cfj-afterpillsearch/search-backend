import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app/app.module';

describe('API Integration Tests (e2e)', () => {
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

  describe('API Key Validation', () => {
    it('should accept valid API key', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/medical-institutions')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200);
    });

    it('should accept production API key', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/medical-institutions')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan')
        .expect(200);
    });

    it('should handle missing API key gracefully', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/medical-institutions')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
        })
        .expect(200); // Currently API key validation is disabled
    });
  });

  describe('Response Structure Validation', () => {
    it('should return consistent response structure for medical institutions', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/medical-institutions')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('meta');
          expect(res.body).toHaveProperty('links');
          expect(res.body).toHaveProperty('results');
          // Validate meta structure
          expect(res.body.meta).toHaveProperty('itemsPerPage');
          expect(res.body.meta).toHaveProperty('totalItems');
          expect(res.body.meta).toHaveProperty('currentPage');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta).toHaveProperty('searchType');
          // Validate links structure
          expect(res.body.links).toHaveProperty('current');
          expect(res.body.links).toHaveProperty('first');
          expect(res.body.links).toHaveProperty('prev');
          expect(res.body.links).toHaveProperty('next');
          expect(res.body.links).toHaveProperty('last');
          // Validate results structure
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });

    it('should return consistent response structure for pharmacies', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/pharmacies')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('meta');
          expect(res.body).toHaveProperty('links');
          expect(res.body).toHaveProperty('results');
          // Validate meta structure
          expect(res.body.meta).toHaveProperty('itemsPerPage');
          expect(res.body.meta).toHaveProperty('totalItems');
          expect(res.body.meta).toHaveProperty('currentPage');
          expect(res.body.meta).toHaveProperty('totalPages');
          expect(res.body.meta).toHaveProperty('searchType');
          // Validate links structure
          expect(res.body.links).toHaveProperty('current');
          expect(res.body.links).toHaveProperty('first');
          expect(res.body.links).toHaveProperty('prev');
          expect(res.body.links).toHaveProperty('next');
          expect(res.body.links).toHaveProperty('last');
          // Validate results structure
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });
  });

  describe('Pagination Behavior', () => {
    it('should handle edge cases in pagination', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/medical-institutions')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
          page: 999, // Very high page number
          perpage: 1,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          // Should default to page 1 when page number is too high
          expect(res.body.meta.currentPage).toBe(1);
        });
    });

    it('should handle invalid perpage values', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/medical-institutions')
        .query({
          latitude: 35.681236,
          longitude: 139.767125,
          perpage: 999, // Very high perpage number
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          // Should default to 10 when perpage is too high
          expect(res.body.meta.itemsPerPage).toBe(10);
        });
    });
  });

  describe('Multiple Parameter Handling', () => {
    it('should handle multiple todofuken and shikuchoson parameters correctly', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/medical-institutions')
        .query({
          todofuken: ['東京都', '神奈川県'],
          shikuchoson: ['町田市', '座間市'],
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(200)
        .expect((res) => {
          expect(res.body.meta.address_todofuken).toBe('東京都,神奈川県');
          expect(res.body.meta.address_shikuchoson).toBe('町田市,座間市');
          expect(Array.isArray(res.body.results)).toBe(true);
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed coordinates gracefully', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/current-location/medical-institutions')
        .query({
          latitude: 'invalid',
          longitude: 139.767125,
        })
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(400);
    });

    it('should handle missing required parameters', () => {
      return request(app.getHttpServer())
        .get('/api/v1/search/address/medical-institutions')
        .query({})
        .set('afterpillsearch-api-key', 'pillnyaaan-dev')
        .expect(400);
    });
  });

  describe('Performance and Load', () => {
    it('should handle concurrent requests', async () => {
      const requests = Array(5)
        .fill(null)
        .map(() =>
          request(app.getHttpServer())
            .get('/api/v1/search/current-location/medical-institutions')
            .query({
              latitude: 35.681236,
              longitude: 139.767125,
            })
            .set('afterpillsearch-api-key', 'pillnyaaan-dev')
            .expect(200),
        );
      await Promise.all(requests);
    });
  });
});
