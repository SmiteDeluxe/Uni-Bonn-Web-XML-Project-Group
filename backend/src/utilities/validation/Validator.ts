// Bearbeitet von ***

import Ajv, { Options } from 'ajv';
import { AnyValidateFunction, ErrorObject, Schema } from 'ajv/dist/types';
import path from 'path';
import config from '../../config';
import Logger from '../Logger';
import parse, { SerializedData } from '../parse';
import { AvailableJSONSchema } from './constants';
import { ValidationRule, ValidatorType } from './types';

export class ValidationError extends Error {
  validationErrorMessages: string[] = [];
  constructor(
    public message: string,
    ...validationErrorMessages: Array<string | undefined>
  ) {
    super(message);
    Object.setPrototypeOf(this, ValidationError.prototype);
    this.validationErrorMessages.push(
      ...(validationErrorMessages.filter((m) => m !== undefined) as string[])
    );
  }
}

export default class GenericValidator<S extends AvailableJSONSchema> {
  private rules: ValidationRule<ValidatorType<S>>[] = [];
  private schemaValidator: Promise<AnyValidateFunction>;
  private schemaPath: string;
  private debug: boolean = config.debugValidation === true ? true : false;
  private ajvOptions: Options = { allowUnionTypes: true };
  private ajv: Ajv = new Ajv(this.ajvOptions);

  constructor(
    private schemaName: S,
    ...rules: ValidationRule<ValidatorType<S>>[]
  ) {
    this.rules.push(...rules);
    this.schemaPath = path.join(
      config.jsonSchemaDir ?? './schemas',
      `${this.schemaName}.schema.json`
    );
    this.schemaValidator = this.loadSchema();
  }

  public async validate(
    data: unknown,
    dataSource?: string
  ): Promise<ValidatorType<S>> {
    const validatedBySchema = await this.validateSchema(data, dataSource);
    await this.validateRules(validatedBySchema);
    return validatedBySchema;
  }

  public async validateSchema(
    data: unknown,
    dataSource?: string
  ): Promise<ValidatorType<S>> {
    const validate = await this.schemaValidator;
    const validated = validate(data);
    if (validated === false) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      this.logSchemaError(validate.errors!, dataSource);
      throw new ValidationError(
        `Error validating ${
          dataSource ? `content of ${dataSource}` : JSON.stringify(data)
        } against JSON Schema "${
          this.schemaName
        }", see logs for further details.`,
        ...(validate.errors?.map((e) => e.message) ?? [])
      );
    }
    return data as ValidatorType<S>;
  }

  public async validateRules(data: ValidatorType<S>, ...ruleArgs: any[]) {
    const errorMessages: string[] = [];
    for (const rule of this.rules) {
      try {
        await rule.validate(data, this.debug, ...ruleArgs);
      } catch (e) {
        if (e instanceof ValidationError) {
          errorMessages.push(...e.validationErrorMessages);
          Logger.error(
            `Error validating data against rule "${rule.title}" for ${
              this.schemaName
            }: ${e.validationErrorMessages.join(', ')}`
          );
        } else if (e instanceof Error) {
          errorMessages.push(e.message);
          Logger.debug(
            `Error validating data against rule ${rule.title} for ${this.schemaName}: ${e.message}`
          );
        } else {
          errorMessages.push(`${e}`);
          Logger.debug(
            `Error validating data against rule ${rule.title} for ${this.schemaName}: ${e}`
          );
        }
      }
    }
    if (errorMessages.length > 0) {
      throw new ValidationError(
        `Error validating data against rules for ${this.schemaName}`,
        ...errorMessages
      );
    }
    return data;
  }

  private async loadSchema() {
    const schema = await parse(this.schemaPath, SerializedData.JSON);
    try {
      return this.ajv.compile<ValidatorType<S>>(schema as Schema);
    } catch (e) {
      Logger.fatal(
        `Error compilig JSON Schema "${this.schemaPath}": ${
          (e as Error).message ?? e
        }`
      );
      throw e;
    }
  }

  private logSchemaError(errors: ErrorObject[], dataSource?: string) {
    for (const error of errors) {
      Logger.error(
        `Error validating data against JSON Schema "${this.schemaName}": "${error.message}"`
      );
      Logger.info(
        `Error validating data against JSON Schema "${this.schemaName}": "${
          error.message
        }" at "${dataSource ?? ''}${
          error.instancePath
        }", caused by "${Object.entries(error.params)
          .map(([k, v]) => `${k}: ${v}`)
          .join(' ,')}"`
      );
    }
  }
}
