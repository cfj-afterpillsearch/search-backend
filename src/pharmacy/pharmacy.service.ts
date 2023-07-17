import { Inject, Injectable } from '@nestjs/common';
import { MONGODB_PHARMACY } from './pharmacy.constants';
import { PharmacyStoreModel } from './types';
import { Collection } from 'mongodb';

@Injectable()
export class PharmacyService {
  constructor(
    @Inject(MONGODB_PHARMACY)
    private readonly phaService: Collection<PharmacyStoreModel>,
  ) {}

  async searchFromCurrentLocation(latitude: number, longitude: number) {
    const result = await this.phaService
      .aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
            maxDistance: 6000,
            spherical: true,
            distanceField: 'calcDistance',
          },
        },
      ])
      .toArray();
    return result;
  }

  async searchFromAddress(todofuken: string, shikuchoson: string) {
    const query =
      shikuchoson === ''
        ? { address_todofuken: todofuken }
        : { address_todofuken: todofuken, address_shikuchoson: shikuchoson };

    const result = await this.phaService.find(query).toArray();
    return result;
  }
}
