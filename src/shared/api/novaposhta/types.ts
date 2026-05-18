/**
 * Subset of Nova Poshta API response types we use.
 * Full API reference: https://developers.novaposhta.ua/documentation
 */

export type NpSettlement = {
  Ref: string
  /** "Київ", "Одеса", ... */
  MainDescription: string
  /** "Київська обл., Київський р-н" */
  Area: string
  Region: string
  /** Settlement type: "м.", "смт.", "с." */
  SettlementTypeCode: string
  /** Lowercased name with diacritics removed for fuzzy match */
  Present: string
  Warehouses: string // count
}

export type NpWarehouse = {
  Ref: string
  /** "Відділення №1: вул. Гончара, 3" */
  Description: string
  /** Short name e.g. "Відділення №1" */
  ShortAddress: string
  /** Full city name */
  CityDescription: string
  /** Address: "вул. Гончара, 3" */
  ShortAddressDescription?: string
  /** Type code (e.g. "f9316480-5f2d-11e5-8d8d-0050568002cf" = Postomat) */
  TypeOfWarehouse: string
  /** Numbered: 1, 2, 3 */
  Number: string
  /** "Відділення" or "Поштомат" */
  CategoryOfWarehouse?: string
  /** Schedule per weekday: { Monday: "08:00-21:00", ... } */
  Schedule?: Record<string, string>
  /** Hidden = "1" means disabled */
  WarehouseStatus?: string
}

export type NpApiSuccess<T> = {
  success: true
  data: T[]
  errors: string[]
  warnings: string[]
  info: unknown
  messageCodes: string[]
  errorCodes: string[]
  warningCodes: string[]
  infoCodes: string[]
}

export type NpApiError = {
  success: false
  data: []
  errors: string[]
  warnings: string[]
  info: unknown
  messageCodes: string[]
  errorCodes: string[]
  warningCodes: string[]
  infoCodes: string[]
}

export type NpApiResponse<T> = NpApiSuccess<T> | NpApiError

/** Type code for postomats (parcel lockers) used in `TypeOfWarehouse`. */
export const NP_TYPE_POSTOMAT = 'f9316480-5f2d-11e5-8d8d-0050568002cf'

/** Type code for regular branches. */
export const NP_TYPE_BRANCH = '841339c7-591a-42e2-8233-7a0a00f0ed6f'
