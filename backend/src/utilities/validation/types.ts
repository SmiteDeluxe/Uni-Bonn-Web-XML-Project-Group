import {
  AutomationCreate,
  AutomationUpdate,
} from '../../models/api/AutomationModels';
import { DeviceState } from '../../models/api/StateModels';
import ConfigContent from '../../models/config/ConfigContent';
import TemplateConfig from '../../models/config/TemplateConfig';
import ConfigMerged from '../../models/internal/ConfigMerged';
import { AvailableJSONSchema } from './constants';

export type ValidatorType<S extends AvailableJSONSchema> =
  S extends AvailableJSONSchema.CONFIG_FILE_CONTENT
    ? ConfigContent
    : S extends AvailableJSONSchema.MERGED_CONFIG
    ? ConfigMerged
    : S extends AvailableJSONSchema.TEMPLATE
    ? TemplateConfig
    : S extends AvailableJSONSchema.AUTOMATION_CREATE
    ? AutomationCreate
    : S extends AvailableJSONSchema.AUTOMATION_UPDATE
    ? AutomationUpdate
    : S extends AvailableJSONSchema.DEVICE_STATE
    ? DeviceState
    : never;

export interface ValidationRule<T> {
  validate: (data: T, debug: boolean, ...args: any[]) => void | Promise<void>;
  description?: string;
  title: string;
}
