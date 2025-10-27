import 'reflect-metadata';

export const FILTER_PROPERTY_METADATA_KEY = Symbol('FilterProperty');

export function FilterProperty(entityPropertyName: string): PropertyDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(FILTER_PROPERTY_METADATA_KEY, entityPropertyName, target, propertyKey);
  };
}

export function getFilterProperty(target: any, propertyKey: string): string | undefined {
  return Reflect.getMetadata(FILTER_PROPERTY_METADATA_KEY, target, propertyKey);
}
