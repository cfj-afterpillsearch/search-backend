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
  async searchMedicalInstitution(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perpage', new DefaultValuePipe(20), ParseIntPipe)
    itemsPerPage: number,
  ) {
    const { todofuken, shikuchoson } =
      await this.googleGeocodeService.getAddress(latitude, longitude);

    const result = await this.miService.searchMedicalInstitution(
      latitude,
      longitude,
    );

    const meta = {
      itemsPerPage,
      totalItems: result.length,
      currentPage: page,
      totalPages: Math.ceil(result.length / itemsPerPage),
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
    const results = result.slice(
      (page - 1) * itemsPerPage,
      (page - 1) * itemsPerPage + itemsPerPage,
    );

    return { meta, links, results };
  }
}
