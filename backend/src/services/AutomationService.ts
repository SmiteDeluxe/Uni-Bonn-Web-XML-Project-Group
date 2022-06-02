// Bearbeitet von ***

import { getFutureMatches } from '@datasert/cronjs-matcher';
import { AsyncClient } from 'async-mqtt';
import { DateTime } from 'luxon';
import AutomationConfig from '../models/config/AutomationConfig';
import { ActionType, AutomationAction } from '../models/internal/Automation';
import Topics from '../topics/Topics';
import Logger from '../utilities/Logger';
import { fill } from '../utilities/topicTools';
import ConfigService from './ConfigService';

interface Execution {
  action: AutomationAction;
  nextExecution: DateTime;
  automationId: string;
}

export class AutomationService {
  private runSchedule = false;
  private nextExecutions: Execution[] = [];
  private timeoutIds: number[] = [];

  constructor(private config: ConfigService, private client: AsyncClient) {
    this.config.on('updatedAutomationConfig', () => {
      Logger.trace(
        `${
          this.runSchedule ? 'Res' : 'S'
        }tarting AutomationController with updated automation config`
      );
      this.start();
    });
  }

  start() {
    this.runSchedule = true;
    this.schedule();
  }

  stop() {
    this.runSchedule = false;
  }

  private async schedule() {
    const nextExecutions = await this.getNextExecutions();
    if (nextExecutions.length === 0) {
      this.runSchedule = false;
      return;
    }

    const nextTimeout =
      nextExecutions[0].nextExecution.toMillis() - DateTime.now().toMillis();
    const currentExectutions = [...this.nextExecutions];
    this.nextExecutions = nextExecutions;

    Logger.trace(
      `Automation service timeout for ${
        nextTimeout / 1000
      } seconds (until ${nextExecutions[0].nextExecution.toLocal()})`
    );
    Logger.trace(
      `Upcoming automations at ${nextExecutions[0].nextExecution.toLocal()} after timeout: ${nextExecutions
        .map((e) => `action "${e.action.id}" of automation "${e.automationId}"`)
        .join(', ')}`
    );
    setTimeout(() => {
      this.schedule();
    }, nextTimeout);

    if (currentExectutions.length > 0) {
      for (const execution of currentExectutions) {
        Logger.trace(
          `Executing action "${execution.action.id}" of automation "${execution.automationId}"`
        );
        switch (execution.action.type) {
          case ActionType.DEVICE_STATE:
            for (const device of execution.action.states) {
              this.client.publish(
                fill(Topics.statemanagement.post, {
                  clientId: 'automation',
                  deviceId: device.deviceId,
                }),
                JSON.stringify({ states: device.states })
              );
            }
            break;
          case ActionType.MQTT_MESSAGE:
            this.client.publish(
              execution.action.topic,
              execution.action.payload
            );
        }
      }
    }
  }

  async getNextExecutions(
    timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  ): Promise<Execution[]> {
    const automations =
      (await this.config.getAllAutomations()) as AutomationConfig[];
    const nextExecutions: Execution[] = [];
    const startAt = DateTime.now()
      .startOf('second')
      .plus({ seconds: 1 })
      .toISO();

    // Get actions which have a future execution
    for (const automation of automations) {
      if (automation.active !== undefined && !automation.active) {
        Logger.trace(
          `Skipping generation of next executions for deactivated automation "${automation.id}"`
        );
        continue;
      }
      for (const action of automation.actions) {
        const matches = getFutureMatches(action.schedule, {
          startAt,
          matchCount: 1,
          timezone,
        });
        if (matches.length === 0) continue;
        const nextExecution = DateTime.fromISO(matches[0]).startOf('second');
        // Check that execution is not after endDate
        if (
          automation.endDate !== undefined &&
          DateTime.fromISO(automation.endDate) < nextExecution
        )
          continue;
        // Check that execution is not before startDate
        if (
          automation.startDate !== undefined &&
          nextExecution < DateTime.fromISO(automation.startDate)
        )
          continue;
        nextExecutions.push({
          automationId: automation.id,
          action,
          nextExecution,
        });
      }
    }

    // Sort next execution by which is the soonest
    nextExecutions.sort((a, b) =>
      a.nextExecution < b.nextExecution
        ? -1
        : a.nextExecution > b.nextExecution
        ? 1
        : 0
    );

    // Return all executions with the soonest execution
    return nextExecutions.filter(
      (e) =>
        nextExecutions[0].nextExecution.toMillis() ===
        e.nextExecution.toMillis()
    );
  }
}
