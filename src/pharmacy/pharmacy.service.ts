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

  /**
   * @param latitude
   * @param longitude
   * @param is_out_of_hours 0:指定なし、1:有
   * @returns
   */
  async searchFromCurrentLocation(
    latitude: number,
    longitude: number,
    is_out_of_hours: number,
  ) {
    const queryArray: any = [
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
    ];

    if (is_out_of_hours === 1) {
      queryArray.push({
        $match: {
          $and: [
            {
              emergency_contact_phone: { $ne: '' },
            },
            {
              emergency_contact_phone: { $ne: null },
            },
          ],
        },
      });
    }
    const result = await this.phaService.aggregate(queryArray).toArray();
    return result;
  }

  async searchFromAddress(
    todofuken: string,
    shikuchoson: string,
    is_out_of_hours: number,
  ) {
    const query =
      shikuchoson === ''
        ? { address_todofuken: todofuken }
        : { address_todofuken: todofuken, address_shikuchoson: shikuchoson };

    if (is_out_of_hours === 1) {
      query['$and'] = [
        {
          emergency_contact_phone: { $ne: '' },
        },
        {
          emergency_contact_phone: { $ne: null },
        },
      ];
    }

    const result = await this.phaService.find(query).toArray();
    return result;
  }
}
