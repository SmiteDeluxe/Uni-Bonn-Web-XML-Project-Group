import { writeFile } from 'fs/promises';
import path from 'path';
import * as tsj from 'ts-json-schema-generator';
import { AvailableJSONSchema } from './src/utilities/validation/constants';
import config from './src/config';

for (const schemaName of Object.values(AvailableJSONSchema)) {
  generateJsonSchema(schemaName);
}

async function generateJsonSchema(type: AvailableJSONSchema) {
  const tsjConfig: tsj.Config = {
    path: './src/**/*.ts',
    tsconfig: './tsconfig.json',
    type,
  };
  const schema = tsj.createGenerator(tsjConfig).createSchema(tsjConfig.type);
  const schemaString = JSON.stringify(schema, null, 2);
  const schemaPath = path.join(
    config.jsonSchemaDir ?? './schemas',
    `${type}.schema.json`
  );
  await writeFile(schemaPath, schemaString);
  console.log(
    `Generated JSON Schema for type "${type}", saving in "${schemaPath}"`
  );
}
