import {convertUnits} from './unit-convert';

test('converts using convertUnits()', () => {
  expect(convertUnits('m', 'cm', 2)).toBe('200.00');
  expect(convertUnits('feet', 'cm', 3.281)).toBe('100.00');
  expect(convertUnits('lbs', 'kg', 22.0462)).toBe('10.00');

  expect(convertUnits('cm', 'm', 1000)).toBe('10.00');
  expect(convertUnits('cm', 'feet', 60.96)).toBe('2.00');
  expect(convertUnits('kg', 'lbs', 0.907185)).toBe('2.00');

  expect(convertUnits('lbs', 'lbs', 2)).toBe('2.00');
  expect(convertUnits('feet', 'feet', 2)).toBe('2.00');
  expect(convertUnits('m', 'm', 2)).toBe('2.00');
});
