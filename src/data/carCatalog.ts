/**
 * Car make/model catalog for the autoservice form. Focused on EVs and hybrids
 * but covers common ICE brands as a fallback. "Інше" lets the customer free-type.
 */
export const CAR_CATALOG: { make: string; models: string[] }[] = [
  { make: 'Tesla', models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'] },
  { make: 'BYD', models: ['Seal', 'Atto 3', 'Han', 'Dolphin', 'Tang', 'Yuan Plus', 'Song'] },
  { make: 'Hyundai', models: ['IONIQ 5', 'IONIQ 6', 'Kona Electric', 'Tucson', 'Santa Fe'] },
  { make: 'Kia', models: ['EV6', 'EV9', 'Niro EV', 'Soul EV', 'Sportage'] },
  { make: 'Volkswagen', models: ['ID.3', 'ID.4', 'ID.5', 'ID.6', 'ID. Buzz', 'e-Golf', 'Tiguan'] },
  { make: 'Audi', models: ['e-tron', 'Q4 e-tron', 'Q6 e-tron', 'Q8 e-tron', 'e-tron GT', 'A4', 'Q5'] },
  { make: 'Mercedes-Benz', models: ['EQA', 'EQB', 'EQC', 'EQE', 'EQS', 'EQV', 'GLC', 'C-Class'] },
  { make: 'BMW', models: ['i3', 'i4', 'iX', 'iX1', 'iX3', 'i7', 'X3', 'X5'] },
  { make: 'Polestar', models: ['Polestar 2', 'Polestar 3', 'Polestar 4'] },
  { make: 'Volvo', models: ['XC40 Recharge', 'EX30', 'EX90', 'C40 Recharge', 'XC60', 'XC90'] },
  { make: 'Nissan', models: ['Leaf', 'Ariya', 'X-Trail', 'Qashqai'] },
  { make: 'Renault', models: ['Megane E-Tech', 'ZOE', 'Twingo Electric', 'Captur'] },
  { make: 'Peugeot', models: ['e-208', 'e-2008', 'e-308', 'e-3008'] },
  { make: 'Citroën', models: ['ë-C4', 'ë-Berlingo', 'ë-C3'] },
  { make: 'Toyota', models: ['bZ4X', 'Prius', 'RAV4', 'Corolla', 'Camry'] },
  { make: 'Honda', models: ['e:Ny1', 'Civic', 'CR-V'] },
  { make: 'Skoda', models: ['Enyaq', 'Octavia', 'Superb', 'Karoq', 'Kodiaq'] },
  { make: 'Porsche', models: ['Taycan', 'Macan EV', 'Cayenne'] },
  { make: 'Lucid', models: ['Air', 'Gravity'] },
  { make: 'Rivian', models: ['R1T', 'R1S'] },
  { make: 'Ford', models: ['Mustang Mach-E', 'F-150 Lightning', 'Kuga', 'Focus'] },
  { make: 'Chevrolet', models: ['Bolt EV', 'Bolt EUV', 'Silverado EV'] },
  { make: 'Інше', models: [] },
]

export const CAR_MAKES = CAR_CATALOG.map((c) => c.make)

export function getModels(make: string): string[] {
  return CAR_CATALOG.find((c) => c.make === make)?.models ?? []
}
