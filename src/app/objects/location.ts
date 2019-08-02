export interface Location {
  id?: number;
  name?: string;
  lat?: number;
  lon?: number;
  hasUnisex?: boolean;
  unisexRate?: number;
  hasMens?: boolean;
  mensRate?: number;
  hasWomens?: boolean;
  womensRate?: number;
  hasFamily?: boolean;
  familyRate?: number;
  hasBabyChanging?: boolean;
  hasBlowDryer?: boolean;
  hasPaperTowels?: boolean;
  icon?: string;
}
