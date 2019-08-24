const PI = Math.PI;

export function degreesToRadians(degrees: number) {
  return (degrees * PI) / 180;
}

export function evaluateViewBoxSize(ratio: number, baseSize: number) {
  // Wide ratio
  if (ratio > 1) {
    return `0 0 ${baseSize} ${baseSize / ratio}`;
  }
  // Narrow/squared ratio
  return `0 0 ${baseSize * ratio} ${baseSize}`;
}

export function evaluateLabelTextAnchor({
  labelPosition,
  lineWidth,
  labelHorizontalShift,
}: {
  labelPosition: number;
  lineWidth: number;
  labelHorizontalShift: number;
}) {
  // Label in the vertical center
  if (labelHorizontalShift === 0) {
    return 'middle';
  }
  // Outward label
  if (labelPosition > 100) {
    return labelHorizontalShift > 0 ? 'start' : 'end';
  }
  // Inward label
  const innerRadius = 100 - lineWidth;
  if (labelPosition < innerRadius) {
    return labelHorizontalShift > 0 ? 'end' : 'start';
  }
  // Overlying label
  return 'middle';
}

export function valueBetween(value: number, min: number, max: number) {
  if (value > max) return max;
  if (value < min) return min;
  return value;
}

export function extractPercentage(value: number, percentage: number) {
  return (value * percentage) / 100;
}
