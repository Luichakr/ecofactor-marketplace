import type { NpSettlement, NpWarehouse } from './types'
import { NP_TYPE_BRANCH, NP_TYPE_POSTOMAT } from './types'

/**
 * Demo data used when no NP API key is provided. Lets the UI work without
 * a real connection so the dev/preview flow still works.
 */

export const MOCK_SETTLEMENTS: NpSettlement[] = [
  {
    Ref: 'mock-kyiv',
    MainDescription: 'Київ',
    Area: 'Київська обл.',
    Region: '',
    SettlementTypeCode: 'м.',
    Present: 'м. Київ, Київська обл.',
    Warehouses: '300',
  },
  {
    Ref: 'mock-odesa',
    MainDescription: 'Одеса',
    Area: 'Одеська обл.',
    Region: '',
    SettlementTypeCode: 'м.',
    Present: 'м. Одеса, Одеська обл.',
    Warehouses: '120',
  },
  {
    Ref: 'mock-lviv',
    MainDescription: 'Львів',
    Area: 'Львівська обл.',
    Region: '',
    SettlementTypeCode: 'м.',
    Present: 'м. Львів, Львівська обл.',
    Warehouses: '85',
  },
  {
    Ref: 'mock-kharkiv',
    MainDescription: 'Харків',
    Area: 'Харківська обл.',
    Region: '',
    SettlementTypeCode: 'м.',
    Present: 'м. Харків, Харківська обл.',
    Warehouses: '95',
  },
  {
    Ref: 'mock-dnipro',
    MainDescription: 'Дніпро',
    Area: 'Дніпропетровська обл.',
    Region: '',
    SettlementTypeCode: 'м.',
    Present: 'м. Дніпро, Дніпропетровська обл.',
    Warehouses: '80',
  },
]

function mockWarehouse(
  ref: string,
  city: string,
  number: string,
  address: string,
  type: 'branch' | 'postomat' = 'branch',
): NpWarehouse {
  const isPostomat = type === 'postomat'
  return {
    Ref: ref,
    Description: `${isPostomat ? 'Поштомат' : 'Відділення'} №${number}: ${address}`,
    ShortAddress: `${isPostomat ? 'Поштомат' : 'Відділення'} №${number}`,
    CityDescription: city,
    ShortAddressDescription: address,
    TypeOfWarehouse: isPostomat ? NP_TYPE_POSTOMAT : NP_TYPE_BRANCH,
    Number: number,
    CategoryOfWarehouse: isPostomat ? 'Postomat' : 'Branch',
  }
}

export const MOCK_WAREHOUSES: Record<string, NpWarehouse[]> = {
  'mock-kyiv': [
    mockWarehouse('w-1', 'Київ', '1', 'вул. Пирогова, 19'),
    mockWarehouse('w-2', 'Київ', '5', 'вул. Хрещатик, 22'),
    mockWarehouse('w-3', 'Київ', '24', 'просп. Перемоги, 35'),
    mockWarehouse('w-4', 'Київ', '101', 'вул. Антоновича, 50'),
    mockWarehouse('w-5', 'Київ', '15347', 'просп. Бажана, 30 (ТЦ Аладдін)', 'postomat'),
    mockWarehouse('w-6', 'Київ', '15348', 'вул. Драгомирова, 4 (Сільпо)', 'postomat'),
  ],
  'mock-odesa': [
    mockWarehouse('w-7', 'Одеса', '1', 'вул. Дерибасівська, 14'),
    mockWarehouse('w-8', 'Одеса', '7', 'вул. Преображенська, 24'),
    mockWarehouse('w-9', 'Одеса', '12', 'просп. Шевченка, 8'),
    mockWarehouse('w-10', 'Одеса', '15500', 'вул. Канатна, 50 (АТБ)', 'postomat'),
  ],
  'mock-lviv': [
    mockWarehouse('w-11', 'Львів', '1', 'просп. Свободи, 5'),
    mockWarehouse('w-12', 'Львів', '4', 'вул. Городоцька, 73'),
    mockWarehouse('w-13', 'Львів', '15601', 'вул. Сихівська, 12 (Сільпо)', 'postomat'),
  ],
  'mock-kharkiv': [
    mockWarehouse('w-14', 'Харків', '1', 'вул. Сумська, 78'),
    mockWarehouse('w-15', 'Харків', '11', 'просп. Гагаріна, 16'),
  ],
  'mock-dnipro': [
    mockWarehouse('w-16', 'Дніпро', '1', 'вул. Січеславська, 12'),
    mockWarehouse('w-17', 'Дніпро', '8', 'просп. Поля, 4'),
  ],
}

export function mockSearchSettlements(query: string): NpSettlement[] {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  return MOCK_SETTLEMENTS.filter(
    (s) =>
      s.MainDescription.toLowerCase().includes(q) ||
      s.Present.toLowerCase().includes(q),
  )
}

export function mockGetWarehouses(settlementRef: string, findByString = ''): NpWarehouse[] {
  const all = MOCK_WAREHOUSES[settlementRef] ?? []
  const q = findByString.trim().toLowerCase()
  if (!q) return all
  return all.filter(
    (w) =>
      w.Description.toLowerCase().includes(q) ||
      w.Number.toLowerCase().includes(q),
  )
}
