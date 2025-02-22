import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'isValidTimeFormat', async: false })
export class IsValidTimeFormatConstraint
  implements ValidatorConstraintInterface
{
  validate(value: string) {
    // Regex to check if value is in HH:MM:SS format
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(value);
  }

  defaultMessage() {
    return 'Must be a valid time in HH:MM:SS format.';
  }
}

export function IsValidTimeFormat(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidTimeFormat',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidTimeFormatConstraint,
    });
  };
}
