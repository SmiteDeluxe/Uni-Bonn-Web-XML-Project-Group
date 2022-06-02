import AutomationConfig from '../config/AutomationConfig';
export type AutomationRead = AutomationConfig;

export type AutomationCreateObj = Omit<AutomationConfig, 'id'>;
export interface AllAutomationsResponse {
  automations: AutomationRead[];
}

export interface AutomationCreate {
  automation: AutomationCreateObj;
}
export interface AutomationUpdate {
  automation: AutomationConfig;
}
