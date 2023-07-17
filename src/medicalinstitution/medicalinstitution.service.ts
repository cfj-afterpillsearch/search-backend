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

  async searchFromCurrentLocation(latitude: number, longitude: number) {
    const result = await this.miService
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

    const result = await this.miService.find(query).toArray();
    return result;
  }
}
