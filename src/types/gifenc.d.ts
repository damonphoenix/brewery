declare module "gifenc" {
  export function quantize(data: Uint8Array | Uint8ClampedArray, maxColors: number): any;
  export function applyPalette(data: Uint8Array | Uint8ClampedArray, palette: any): any;
  export function GIFEncoder(): any;
}
