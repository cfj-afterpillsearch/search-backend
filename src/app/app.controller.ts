import {
  BadRequestException,
  Controller,
  DefaultValuePipe,
  Get,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { GoogleGeocodingService } from '../google-geocoding/google-geocoding.service';
import { MedicalinstitutionService } from '../medicalinstitution/medicalinstitution.service';
import { SearchInterceptor } from '../intercepter/search/search.interceptor';
import { PharmacyService } from '../pharmacy/pharmacy.service';

@UseInterceptors(SearchInterceptor)
@Controller()
export class AppController {
  constructor(
    private readonly googleGeocodeService: GoogleGeocodingService,
    private readonly miService: MedicalinstitutionService,
    private readonly phaService: PharmacyService,
  ) {}

  @Get('/api/v1/search/current-location/medical-institutions')
  async searchMedicalInstitution_currentlocation(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perpage', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
    @Query('is_open_sunday', new DefaultValuePipe(0), ParseIntPipe)
    is_open_sunday: number,
    @Query('is_open_holiday', new DefaultValuePipe(0), ParseIntPipe)
    is_open_holiday: number,
  ) {
    const { todofuken, shikuchoson } =
      await this.googleGeocodeService.getAddress(latitude, longitude);

    const records = await this.miService.searchFromCurrentLocation(
      latitude,
      longitude,
      is_open_sunday,
      is_open_holiday,
    );

    const totalItems = records.length;

    // pageパラメータが不正な場合は、1ページ目を返す。 TODO: Pipeで実装する
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) {
      page = 1;
    }

    // perpageパラメータが不正な場合は、10件を返す。 TODO: Pipeで実装する
    if (itemsPerPage < 1 || itemsPerPage > 100) {
      itemsPerPage = 10;
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

    const baseUrl = `/api/v1/search/current-location/medical-institutions?latitude=${latitude}&longitude=${longitude}`;

    const links = {
      current: `${baseUrl}&page=${page}`,
      first: `${baseUrl}&page=1`,
      prev: page > 1 ? `${baseUrl}&page=${page - 1}` : null,
      next: page < meta.totalPages ? `${baseUrl}&page=${page + 1}` : null,
      last: `${baseUrl}&page=${meta.totalPages}`,
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
          memo_openinghours: item.openinghours,
          isOpenSunday: item.isOpenSunday,
          isOpenHoliday: item.isOpenHoliday,
          location: {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
          },
        };
      });

    return { meta, links, results };
  }

  @Get('/api/v1/search/address/medical-institutions')
  async searchMedicalInstitution_address(
    @Query('todofuken', new DefaultValuePipe([]))
    todofuken: string | string[],
    @Query('shikuchoson', new DefaultValuePipe([]))
    shikuchoson: string | string[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perpage', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
    @Query('is_open_sunday', new DefaultValuePipe(0), ParseIntPipe)
    is_open_sunday: number,
    @Query('is_open_holiday', new DefaultValuePipe(0), ParseIntPipe)
    is_open_holiday: number,
  ) {
    // パラメータが空の場合はエラーを返す
    if (todofuken === '') {
      throw new BadRequestException('todofuken is required');
    }

    // todofukenを配列に統一（?todofuken=東京都&todofuken=神奈川県形式に対応）
    const todofukenArray = Array.isArray(todofuken) ? todofuken : [todofuken];

    if (todofukenArray.length === 0) {
      throw new BadRequestException('todofuken is required');
    }

    // shikuchosonを配列に統一（?shikuchoson=町田市&shikuchoson=相模原市形式に対応）
    const shikuchosonArray = Array.isArray(shikuchoson)
      ? shikuchoson
      : [shikuchoson];

    const records = await this.miService.searchFromAddress(
      todofukenArray,
      shikuchosonArray,
      is_open_sunday,
      is_open_holiday,
    );

    const totalItems = records.length;

    // pageパラメータが不正な場合は、1ページ目を返す。 TODO: Pipeで実装する
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) {
      page = 1;
    }

    // perpageパラメータが不正な場合は、10件を返す。 TODO: Pipeで実装する
    if (itemsPerPage < 1 || itemsPerPage > 100) {
      itemsPerPage = 10;
    }

    const meta = {
      itemsPerPage,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      searchType: 'address',
      address_todofuken: todofukenArray.join(','),
      address_shikuchoson: shikuchosonArray.join(','),
    };

    // リンク生成時に?todofuken=東京都&todofuken=神奈川県形式を使用
    const todofukenParams = todofukenArray
      .map((t) => `todofuken=${encodeURIComponent(t)}`)
      .join('&');
    const shikuchosonParams = shikuchosonArray
      .map((s) => `shikuchoson=${encodeURIComponent(s)}`)
      .join('&');
    const baseUrl = `/api/v1/search/current-location/medical-institutions?${todofukenParams}&${shikuchosonParams}`;

    const links = {
      current: `${baseUrl}&page=${page}`,
      first: `${baseUrl}&page=1`,
      prev: page > 1 ? `${baseUrl}&page=${page - 1}` : null,
      next: page < meta.totalPages ? `${baseUrl}&page=${page + 1}` : null,
      last: `${baseUrl}&page=${meta.totalPages}`,
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
          memo_openinghours: item.openinghours,
          isOpenSunday: item.isOpenSunday,
          isOpenHoliday: item.isOpenHoliday,
          location: {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
          },
        };
      });

    return { meta, links, results };
  }

  @Get('/api/v1/search/current-location/pharmacies')
  async searchPharmacy_currentlocation(
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perpage', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
    @Query('is_out_of_hours', new DefaultValuePipe(0), ParseIntPipe)
    is_out_of_hours: number,
  ) {
    const { todofuken, shikuchoson } =
      await this.googleGeocodeService.getAddress(latitude, longitude);

    const records = await this.phaService.searchFromCurrentLocation(
      latitude,
      longitude,
      is_out_of_hours,
    );

    const totalItems = records.length;

    // pageパラメータが不正な場合は、1ページ目を返す。 TODO: Pipeで実装する
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) {
      page = 1;
    }

    // perpageパラメータが不正な場合は、10件を返す。 TODO: Pipeで実装する
    if (itemsPerPage < 1 || itemsPerPage > 100) {
      itemsPerPage = 10;
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

    const baseUrl = `/api/v1/search/current-location/pharmacy?latitude=${latitude}&longitude=${longitude}`;

    const links = {
      current: `${baseUrl}&page=${page}`,
      first: `${baseUrl}&page=1`,
      prev: page > 1 ? `${baseUrl}&page=${page - 1}` : null,
      next: page < meta.totalPages ? `${baseUrl}&page=${page + 1}` : null,
      last: `${baseUrl}&page=${meta.totalPages}`,
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
          memo_openinghours: item.openinghours,
          emergency_contact: item.emergency_contact,
          emergency_contact_phone: item.emergency_contact_phone,
          location: {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
          },
        };
      });

    return { meta, links, results };
  }

  @Get('/api/v1/search/address/pharmacies')
  async searchPharmacy_address(
    @Query('todofuken', new DefaultValuePipe([]))
    todofuken: string | string[],
    @Query('shikuchoson', new DefaultValuePipe([]))
    shikuchoson: string | string[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perpage', new DefaultValuePipe(10), ParseIntPipe)
    itemsPerPage: number,
    @Query('is_out_of_hours', new DefaultValuePipe(0), ParseIntPipe)
    is_out_of_hours: number,
  ) {
    // パラメータが空の場合はエラーを返す
    if (todofuken === '') {
      throw new BadRequestException('todofuken is required');
    }

    // todofukenを配列に統一（?todofuken=東京都&todofuken=神奈川県形式に対応）
    const todofukenArray = Array.isArray(todofuken) ? todofuken : [todofuken];

    if (todofukenArray.length === 0) {
      throw new BadRequestException('todofuken is required');
    }

    // shikuchosonを配列に統一（?shikuchoson=町田市&shikuchoson=相模原市形式に対応）
    const shikuchosonArray = Array.isArray(shikuchoson)
      ? shikuchoson
      : [shikuchoson];

    const records = await this.phaService.searchFromAddress(
      todofukenArray,
      shikuchosonArray,
      is_out_of_hours,
    );

    const totalItems = records.length;

    // pageパラメータが不正な場合は、1ページ目を返す。 TODO: Pipeで実装する
    if (page < 1 || page > Math.ceil(totalItems / itemsPerPage)) {
      page = 1;
    }

    // perpageパラメータが不正な場合は、10件を返す。 TODO: Pipeで実装する
    if (itemsPerPage < 1 || itemsPerPage > 100) {
      itemsPerPage = 10;
    }

    const meta = {
      itemsPerPage,
      totalItems,
      currentPage: page,
      totalPages: Math.ceil(totalItems / itemsPerPage),
      searchType: 'address',
      address_todofuken: todofukenArray.join(','),
      address_shikuchoson: shikuchosonArray.join(','),
    };

    // リンク生成時に?todofuken=東京都&todofuken=神奈川県形式を使用
    const todofukenParams = todofukenArray
      .map((t) => `todofuken=${encodeURIComponent(t)}`)
      .join('&');
    const shikuchosonParams = shikuchosonArray
      .map((s) => `shikuchoson=${encodeURIComponent(s)}`)
      .join('&');
    const baseUrl = `/api/v1/search/current-location/pharmacy?${todofukenParams}&${shikuchosonParams}`;

    const links = {
      current: `${baseUrl}&page=${page}`,
      first: `${baseUrl}&page=1`,
      prev: page > 1 ? `${baseUrl}&page=${page - 1}` : null,
      next: page < meta.totalPages ? `${baseUrl}&page=${page + 1}` : null,
      last: `${baseUrl}&page=${meta.totalPages}`,
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
          memo_openinghours: item.openinghours,
          emergency_contact: item.emergency_contact,
          emergency_contact_phone: item.emergency_contact_phone,
          location: {
            lat: item.location.coordinates[1],
            lng: item.location.coordinates[0],
          },
        };
      });

    return { meta, links, results };
  }
}
