export interface PharmacyStoreModel {
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
  available_date: string;
  location: {
    type: 'Point';
    coordinates: number[];
  };
}
