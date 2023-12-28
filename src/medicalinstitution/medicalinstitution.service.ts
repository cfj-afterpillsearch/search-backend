import { Inject, Injectable } from '@nestjs/common';
import { Collection } from 'mongodb';
import { MONGODB_MEDICALINSTITUTION } from './medicalinstitution.constants';
import { MedicalinstitutionStoreModel } from './types';

@Injectable()
export class MedicalinstitutionService {
  constructor(
    @Inject(MONGODB_MEDICALINSTITUTION)
    private readonly miService: Collection<MedicalinstitutionStoreModel>,
  ) {}

  /**
   * @param latitude
   * @param longitude
   * @param is_open_sunday 0:指定なし、1:〇、2:△
   * @param is_open_holiday 0:指定なし、1:〇、2:△
   * @returns
   */
  async searchFromCurrentLocation(
    latitude: number,
    longitude: number,
    is_open_sunday: number,
    is_open_holiday: number,
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

    if (is_open_sunday !== 0) {
      queryArray.push({
        $match: {
          isOpenSunday: is_open_sunday === 1 ? '◯' : { $in: ['◯', '△'] },
        },
      });
    }

    if (is_open_holiday !== 0) {
      queryArray.push({
        $match: {
          isOpenHoliday: is_open_holiday === 1 ? '◯' : { $in: ['◯', '△'] },
        },
      });
    }
    const result = await this.miService.aggregate(queryArray).toArray();
    return result;
  }

  async searchFromAddress(
    todofuken: string,
    shikuchoson: string,
    is_open_sunday: number,
    is_open_holiday: number,
  ) {
    const query = {
      address_todofuken: todofuken,
      address_shikuchoson: shikuchoson,
      isOpenSunday: is_open_sunday === 1 ? '◯' : { $in: ['◯', '△'] },
      isOpenHoliday: is_open_holiday === 1 ? '◯' : { $in: ['◯', '△'] },
    };

    if (is_open_sunday === 0) {
      delete query.isOpenSunday;
    }

    if (is_open_holiday === 0) {
      delete query.isOpenHoliday;
    }

    const result = await this.miService.find(query).toArray();
    return result;
  }
}
