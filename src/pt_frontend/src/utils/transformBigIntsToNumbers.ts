import { z } from 'zod';

export function transformBigIntsToNumbers<T>(data: T): any {
  const schema = z.any().transform((val: any) => {
    if (typeof val === 'bigint') {
      return Number(val);
    }
    if (typeof val === 'object' && val !== null) {
      if (Array.isArray(val)) {
        return val.map(transformBigIntsToNumbers);
      }

      const transformedObject: { [key: string]: any } = {};
      for (const key in val) {
        if (Object.prototype.hasOwnProperty.call(val, key)) {
          transformedObject[key] = transformBigIntsToNumbers(val[key]);
        }
      }
      return transformedObject;
    }
    return val;
  });

  return schema.parse(data);
}
