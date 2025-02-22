import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isFullDateString', async: false })
export class IsFullDateStringConstraint
  implements ValidatorConstraintInterface
{
  validate(value: Date) {
    return value instanceof Date && !isNaN(value.getTime());
  }

  defaultMessage() {
    return 'Must be a valid Date object in ISO format (e.g., "2024-11-01T16:00:00Z").';
  }
}

export function IsFullDateString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isFullDateString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsFullDateStringConstraint,
    });
  };
}
