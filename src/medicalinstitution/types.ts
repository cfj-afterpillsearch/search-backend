export interface MedicalinstitutionStoreModel {
  _id: {
    $oid: string;
  };
  id: string;
  name: string;
  postalcode: string;
  address_todofuken: string;
  address_shikuchoson: string;
  address: string;
  shikuchosonCode: string;
  phone: string;
  website: string;
  openinghours: string;
  isOpenSunday: string;
  isOpenHoliday: string;
  location: {
    type: 'Point';
    coordinates: number[];
  };
}
