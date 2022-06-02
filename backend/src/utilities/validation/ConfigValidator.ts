// Bearbeitet von ***

import GenericValidator, { ValidationError } from './Validator';
import { AvailableJSONSchema } from './constants';
import Logger from '../Logger';
import * as cronjs from '@datasert/cronjs-parser';
import ConfigMerged from '../../models/internal/ConfigMerged';

const deviceGroupsExist = {
  title: "Device Groups Can't be Undefined",
  validate: (data: ConfigMerged, debug: boolean) => {
    if (data.devices === undefined) return;
    const messages: string[] = [];
    outer: for (const device of data.devices) {
      for (const group of device.groups) {
        const i = data.groups?.findIndex((g) => g.id === group);
        if (i === undefined || i === -1) {
          messages.push(
            `Device "${device.id}" is assigned to undefined group "${group}"`
          );
          if (!debug) break outer;
        }
      }
    }
    if (messages.length > 0) {
      throw new ValidationError('Validation of config failed.', ...messages);
    }
    return;
  },
};

const restrictedDevicesExist = {
  title: "Restricted Devices Can't be Undefined",
  validate: (data: ConfigMerged, debug: boolean) => {
    if (data.users === undefined) return;
    const messages: string[] = [];
    outer: for (const user of data.users) {
      for (const deviceId of user.deviceRestrictions) {
        const i = data.devices?.findIndex((d) => d.id === deviceId);
        if (i === undefined || i === 0) {
          messages.push(
            `User "${user.id}" has restriction on non-existent device "${deviceId}"`
          );
        }
        if (!debug) break outer;
      }
    }
    if (messages.length > 0) {
      throw new ValidationError(
        'Config validation of rule "Restricted Devices Can\'t be Undefined" failed',
        ...messages
      );
    }
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const noEmptyGroups = {
  title: "Defined Groups Shouldn't Be Empty",
  validate: (data: ConfigMerged) => {
    if (data.groups === undefined) return;
    for (const group of data.groups) {
      const i = data.devices?.findIndex((d) => d.id === group.id);
      if (i === undefined || i === -1) {
        Logger.warn(`Configured group "${group.id}" has no assigned devices.`);
      }
    }
  },
};

const validCronExpression = {
  title: 'Schedule must be a valid cron expression',
  validate: (data: ConfigMerged, debug: boolean) => {
    if (data.automations === undefined) return;
    const messages: string[] = [];
    outer: for (const automation of data.automations) {
      for (const action of automation.actions) {
        try {
          cronjs.parse(action.schedule);
        } catch (e) {
          messages.push(
            `Configured automation "${automation.id}" has action "${
              action.id
            }" with ${
              e instanceof Error ? `i${e.message.slice(1)}` : 'invalid schedule'
            }`
          );
          if (!debug) break outer;
        }
      }
    }
    if (messages.length > 0) {
      throw new ValidationError(
        'Config validation of rule "Schedule must be a valid cron expression" failed',
        ...messages
      );
    }
  },
};

const automationActionDevicesMustExist = {
  title: 'Devices used in automation action must exist',
  validate: (data: ConfigMerged, debug: boolean) => {
    if (data.automations === undefined) return;
    const messages: string[] = [];
    outer: for (const automation of data.automations) {
      for (const action of automation.actions) {
        if (action.type === 'deviceState') {
          for (const state of action.states) {
            const i = data.devices?.findIndex((d) => d.id === state.deviceId);
            if (i === undefined || i === -1) {
              messages.push(
                `Configured automation "${automation.id}" has device state action "${action.id}" with unavailable device id "${state.deviceId}"`
              );
              if (!debug) break outer;
            }
          }
        }
      }
    }
    if (messages.length > 0) {
      throw new ValidationError(
        'Config validation of rule "Devices used in automation action must exist" failed',
        ...messages
      );
    }
  },
};

export const ConfigValidator = new GenericValidator(
  AvailableJSONSchema.MERGED_CONFIG,
  deviceGroupsExist,
  restrictedDevicesExist,
  validCronExpression,
  automationActionDevicesMustExist
);
