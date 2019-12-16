export function convertUnits(sourceUnit, targetUnit, sourceValue, roundToFixed=true) {
  if (!sourceValue) return sourceValue;

  let ratios = {
    'm -> cm': 100,
    'feet -> cm': 30.48,
    'lbs -> kg': 0.453592,
  };

  // Reversed conversions
  Object.keys(ratios).forEach((conversion) => {
    const [source, target] = conversion.split(' -> ');
    ratios[`${target} -> ${source}`] = 1 / ratios[conversion];
  });

  const conversion = `${sourceUnit} -> ${targetUnit}`;
  const ratio = sourceUnit === targetUnit ? 1 : ratios[conversion];
  const res = sourceValue * ratio;

  return roundToFixed ? res.toFixed(2) : Math.round(res * 100) / 100;
}

export function getTargetUnit(sourceUnit, toImperial) {
  if (!toImperial) return sourceUnit; // API values are already in metric

  return {
    'kg': 'lbs',
    'cm': 'feet',
  }[sourceUnit] || sourceUnit;
}