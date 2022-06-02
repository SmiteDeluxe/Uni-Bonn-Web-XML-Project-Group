import { MetadataRecord } from './MetadataRecord';

export interface TemplateAction {
  /**
   * ID of the action
   */
  id: string;

  /**
   * Topic the MQTT Message will be sent to
   */
  topic: string;

  /**
   * Type of the action payload. Using `command`, a simple string as send as payload to the device, using `object`, an mapping of inputId and value will be send.
   */
  type: 'command' | 'object';

  /**
   * Input ID(s) the action is applied to. This is used to format the payload of the MQTT message.
   */
  payloadInput: string | string[];
}

export interface TemplateListener {
  /**
   * ID of the action
   */
  id: string;

  /**
   * Topic that will be listened to for state updates
   */
  topic: string;

  /**
   * Type of the payload expected from the device. Using `command`, a simple string is expected as payload, using `object`  mapping of `inputId` and `value`.
   */
  type: 'command' | 'object';

  /**
   * Input ID(s) state updates are beeing applied to. This is used to extract state information from the message payload.
   */
  payloadInput: string | string[];
}

interface TemlateBaseInput {
  id: string;
  name: string;
  path?: string;
  metadata?: MetadataRecord;
}

function isTemplateBaseInput(obj: any) {
  if (!('id' in obj && typeof obj.id === 'string')) return false;
  if (!('name' in obj && typeof obj.id === 'string')) return false;
  return true;
}
interface TemplateDiscreteInput extends TemlateBaseInput {
  states: Array<{ name: string; value: string } | string>;
}

export function isTemplateDiscreteInput(
  obj: any
): obj is TemplateDiscreteInput {
  if (!isTemplateBaseInput(obj)) return false;
  if ('states' in obj) {
    if (!(obj.states instanceof Array)) return false;
    if (
      !(typeof obj.states[0] === 'string' || typeof obj.states[0] === undefined)
    ) {
      const arrayMember = obj.states[0];
      if (!(arrayMember instanceof Object)) return false;
      if (!('name' in arrayMember && typeof arrayMember.name === 'string'))
        return false;
      if (!('value' in arrayMember && typeof arrayMember.value === 'string'))
        return false;
    }
  } else return false;
  return true;
}

interface TemplateRangeInput extends TemlateBaseInput {
  range: {
    min: number;
    max: number;
    stepsize?: number;
  };
}

export function isTemplateRangeInput(obj: any): obj is TemplateRangeInput {
  if (!isTemplateBaseInput(obj)) return false;
  if (!('range' in obj && obj.range instanceof Object)) return false;
  const range = obj.range;
  if (!('min' in range && typeof range.min === 'number')) return false;
  if (!('max' in range && typeof range.max === 'number')) return false;
  if ('stepsize' in range) {
    if (!(typeof range.stepsize === 'number')) return false;
  }
  return true;
}

export type TemplateInput = TemplateDiscreteInput | TemplateRangeInput;

export type TemplateOutput = TemplateInput;

export default interface TemplateConfig {
  /**
   * ID of the template.
   */
  id: string;

  /**
   * Human readable name to be displayed in the frontend
   */
  name: string;

  /**
   * Information which placeholders are used by the template
   */
  placeholders: Array<{
    /**
     * ID of the placeholder
     */
    id: string;

    /**
     * Human readable name to be displayed in GUI clients
     */
    name: string;

    /**
     * Description of the placeholder for GUI clients, e.g.
     * device id which ca be found in the webinterface.
     */
    description: string;
  }>;

  /**
   * Frontend specific meta data
   */
  metadata?: MetadataRecord;

  /**
   * Actions define the actions a controller can apply to the state of a device
   */
  actions: TemplateAction[];

  /**
   * Listeners define which updates of device state can be processed
   */
  listeners: TemplateListener[];

  /**
   * Inputs define which modifiable state is displayed in the frontend.
   */
  inputs: TemplateInput[];

  /**
   * Outputs define which unmodifiable state is displayed in the frontend.
   */
  outputs: TemplateOutput[];
}
