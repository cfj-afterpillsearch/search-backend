import { Inject, Injectable } from '@nestjs/common';
import { Collection, Document } from 'mongodb';
import { MONGODB_MEDICALINSTITUTION } from './medicalinstitution.constants';
import { MedicalinstitutionStoreModel } from './types';

type OpenField = 'isOpenSunday' | 'isOpenHoliday';

const buildOpenQuery = (
  is_open_sunday: number,
  is_open_holiday: number,
): Document => {
  const makeCondition = (flag: number, field: OpenField): Document | null => {
    switch (flag) {
      case 1:
        return { [field]: '◯' };
      case 2:
        return { [field]: { $in: ['◯', '△'] } };
      default:
        return null;
    }
  };

    return {
    ...(makeCondition(is_open_sunday, 'isOpenSunday') ?? {}),
    ...(makeCondition(is_open_holiday, 'isOpenHoliday') ?? {}),
  };
};

@Injectable()
export class MedicalinstitutionService {
  constructor(
    @Inject(MONGODB_MEDICALINSTITUTION)
    private readonly miService: Collection<MedicalinstitutionStoreModel>,
  ) {}

  /**
   * @param latitude
   * @param longitude
   * @param is_open_sunday 0:指定なし、1:〇、2:◯または△
   * @param is_open_holiday 0:指定なし、1:〇、2:◯または△
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

    const openQuery = buildOpenQuery(is_open_sunday, is_open_holiday);
    if (Object.keys(openQuery).length) {
      queryArray.push({ $match: openQuery });
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
    };

    const openQuery = buildOpenQuery(is_open_sunday, is_open_holiday);
    if (Object.keys(openQuery).length) {
      Object.assign(query, openQuery);
    }

    const result = await this.miService.find(query).toArray();
    return result;
  }
}
