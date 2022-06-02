// Bearbeitet von *** & ***

import { MetadataRecord } from './MetadataRecord';

export default interface DeviceConfig {
  id: string;
  name: string;
  icon: string;
  groups: string[];
  template: string;
  placeholders: Record<string, string>;
  metadata?: MetadataRecord;
}
