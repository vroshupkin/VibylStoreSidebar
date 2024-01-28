export const npx = /^win/.test(process.platform) ? 'npx.cmd' : 'npx';

export function is_object(obj: any): obj is {[key: string | number | symbol]: unknown}
{
  return typeof obj === 'object' && obj != null;
}