import { isRecord } from '../../utilities/typeguards/isRecord';

export type MetadataRecord = Record<string, any>;

export function isMetadataRecord(record: any): record is Record<string, any> {
  return isRecord<string, any>(record, 'string', (v: any): v is any => true);
}
