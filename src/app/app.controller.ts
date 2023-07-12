import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GoogleGeocodingService } from '../google-geocoding/google-geocoding.service';
import { MedicalinstitutionService } from 'src/medicalinstitution/medicalinstitution.service';

@Controller()
export class AppController {
  constructor(
    private readonly googleGeocodeService: GoogleGeocodingService,
    private readonly miService: MedicalinstitutionService,
  ) {}

  @Get('/api/v1/search/current-location/medical-institutions')
  async searchMedicalInstitution_currentsearch(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perpage', new DefaultValuePipe(20), ParseIntPipe)
    itemsPerPage: number,
  ) {
    const { todofuken, shikuchoson } =
      await this.googleGeocodeService.getAddress(latitude, longitude);

    const records = await this.miService.searchMedicalInstitution(
      latitude,
      longitude,
    );

    const totalItems = records.length;

    // pageパラメータが不正な場合は、1ページ目を返す。 TODO: Pipeで実装する
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) {
      page = 1;
    }

    // perpageパラメータが不正な場合は、20件を返す。 TODO: Pipeで実装する
    if (itemsPerPage < 1 || itemsPerPage > 100) {
      itemsPerPage = 20;
    }

    const meta = {
      itemsPerPage,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      searchType: 'current-location',
      latitude: latitude,
      longitude: longitude,
      address_todofuken: todofuken,
      address_shikuchoson: shikuchoson,
    };
    const links = {
      current: `/api/v1/search/current-location/medical-institutions?latitude=${latitude}&longitude=${longitude}&page=${page}`,
      first: `/api/v1/search/current-location/medical-institutions?latitude=${latitude}&longitude=${longitude}&page=1`,
      prev:
        page > 1
          ? `/api/v1/search/current-location/medical-institutions?latitude=${latitude}&longitude=${longitude}&page=${
              page - 1
            }`
          : null,
      next:
        page < meta.totalPages
          ? `/api/v1/search/current-location/medical-institutions?latitude=${latitude}&longitude=${longitude}&page=${
              page + 1
            }`
          : null,
      last: `/api/v1/search/current-location/medical-institutions?latitude=${latitude}&longitude=${longitude}&page=${meta.totalPages}`,
    };
    const results = records
      .slice(
        (page - 1) * itemsPerPage,
        (page - 1) * itemsPerPage + itemsPerPage,
      )
      .map((item) => {
        return {
          name: item.name,
          postalcode: item.postalcode,
          address: item.address,
          tel: item.phone,
          url: item.website,
          memo_available_time: item.available_date,
          location: {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
          },
        };
      });

    return { meta, links, results };
  }
}
