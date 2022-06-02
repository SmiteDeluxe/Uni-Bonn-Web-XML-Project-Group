// Edited by: *** ***, *** ***, *** ***

import { client } from "./config";
import store from './store';
import { matchesPattern } from "./helpers/matchesPattern";
import { Automation } from '@/views/Automations/models';

enum responseTopics {
  CLIENTID = "response/clientId",
  GROUPS = "/response/groups",
  DEVICESBYGROUP = "/response/groupDevices/+groupID",
  DEVICES = "/response/devices",
  TEMPLATES = "/response/templates",
  AUTOMATIONS = "/response/automations",
  STATES = "/broadcast/state",
  LOGFILES = '/response/logList',
  LOGFILECONTENT = '/response/log/+logId',
  STATSFILEDAY = '/response/fullDay/+day',
  USERS = "/response/users",
  RESTRICTIONS = "/response/user/+userId",
  BROADCASTGROUPS = "broadcastClient/broadcast/groups",
  BROADCASTDEVICES = "broadcastClient/broadcast/devices",
  BROADCAST_AUTOMATIONS = "broadcastClient/broadcast/automations",
  STATUS_RESPONSE_PREFIX = "/statusResponse/"
}

function StartListening() {
  client.on("message", (topic, message) => {
    const msg =  isJson(message.toString()) ? JSON.parse(message.toString()): message.toString();
     if (matchesPattern(topic, responseTopics.CLIENTID)) {
       console.log(msg);
         store.commit("setClientID", msg);
       }  else if (matchesPattern(topic, store.getters.getClientID + responseTopics.GROUPS)) {
         store.commit("setGroups", msg);
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.DEVICESBYGROUP)) {
         store.commit("setCurrentDevices", msg);
       } // catching responseMessages (f.e. "Device successfully updated") in order to display them in toasts
       else if(topic.includes(store.getters.getClientID) && topic.includes(responseTopics.STATUS_RESPONSE_PREFIX)) { // TODO Abfrage ggf. schöner lösen
         // get type + entity from substring (updateAutomation -> Update & Automation)
         const subTopic = topic.split(responseTopics.STATUS_RESPONSE_PREFIX)[1];
         if(subTopic) {
           let splitSubTopic = subTopic.split(/(?=[A-Z])/);
           if(splitSubTopic.length === 2) {
             splitSubTopic[0] = splitSubTopic[0].charAt(0).toUpperCase() + splitSubTopic[0].slice(1); // 'update' -> 'Update'
             store.commit("setStatusResponse", {entity: splitSubTopic[1], type:  splitSubTopic[0], status: msg});
           }
         }
       }
       // catching all other >= 400 errors in order to display them in toasts
       else if(topic.includes(store.getters.getClientID) && msg?.statusCode && msg.statusCode >= 400) {
         if(msg?.statusMessage === 'Client not registered!') { // todo - replace this hacky method - implement in backend via a special topic e.g. 'XXX/error/clientIdUnknown'
           msg.statusMessage += ' Reloading client in two seconds.';
           setTimeout(() => location.reload(), 2000);
         }
       store.commit("setStatusResponse", {entity: 'Misc', type:  'Any', status: msg});
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.TEMPLATES)) {
         store.commit("setTemplates", msg);
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.AUTOMATIONS)) {
         store.commit("setAutomations", msg);
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.STATES)) {
         console.log(msg);
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.LOGFILES)) {
         store.commit("setLogFiles", msg);
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.LOGFILECONTENT)) {
         store.commit("setLogFileContent", msg);
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.USERS)) {
         store.commit("setUsers", msg);
       } else if (matchesPattern(topic, store.getters.getClientID + responseTopics.RESTRICTIONS)) {
         store.commit("setCurrentUserRules", msg);
       } else if(matchesPattern(topic, store.getters.getClientID + responseTopics.DEVICES)) {
         store.commit("setAllDevices", msg);
       } else if(matchesPattern(topic, responseTopics.BROADCASTGROUPS)) {
         store.commit("setGroups", msg);
       } else if(matchesPattern(topic, responseTopics.BROADCASTDEVICES)) {
         getGroupDevices(store.getters.getCurrentGroup.id);
       } else if(matchesPattern(topic, responseTopics.BROADCAST_AUTOMATIONS)) {
         getAutomations();
       } else if(matchesPattern(topic, store.getters.getClientID + responseTopics.STATSFILEDAY)) {
         store.commit("setStatsDay", msg);
       }
  });
}

export async function InitConnection() {
  StartListening();
  client.publish("request/clientId", "REQUEST");
}

export function getGroups() {
  client.publish(store.getters.getClientID + "/request/groups", "REQUEST");
}

export function postGroup(name: String, type: String, icon: String) {
  const groupObj = { name: name, icon: icon, type: type };
  client.publish(store.getters.getClientID + "/post/group", JSON.stringify(groupObj));
}

export function postDevice(name: String, icon: String, templateId: String, groups: Array<string>, placeholders?: any) {
  const devObj = { name: name, icon: icon, template: templateId, groups: groups, placeholders:  placeholders };
  client.publish(store.getters.getClientID + "/post/device", JSON.stringify(devObj));
}

export function updateGroup(id: String, name: String, type: String, icon: String) {
  const groupObj = { name: name, icon: icon, type: type };
  client.publish(store.getters.getClientID + "/update/group/" + id, JSON.stringify(groupObj));
}

export function updateDevice(id: String, name: String, icon: String, groups: Array<string>, templateId: String, placeholders: Object) {
  const devObj = { name: name, icon: icon, groups: groups, template: templateId, placeholders };
  client.publish(store.getters.getClientID + "/update/device/" + id, JSON.stringify(devObj));
}

export function deleteGroup(id: String) {
  client.publish(store.getters.getClientID + "/delete/group/" + id, "");
}

export function deleteDevice(id: String) {
  client.publish(store.getters.getClientID + "/delete/device/" + id, "");
}

export function getGroupDevices(id: String) {
  client.publish(store.getters.getClientID + "/request/groupDevices/" + id, "REQUEST");
}

export function getTemplates() {
  client.publish(store.getters.getClientID + "/request/templates", "");
}

export function getUsers() {
  client.publish(store.getters.getClientID + "/request/users", "");
}

export function getDeviceInputState(deviceId: string, states: { states: { inputId: string, value: string }[] }) {
  client.publish(store.getters.getClientID + "/request/state/device/" + deviceId, JSON.stringify(states));
}

export function postDeviceInputState(deviceId: string, states: { states: { inputId: string, value: string }[] }) {
  if(states.states.some(el => el.inputId === "gain")) states.states.push({ inputId: "mode", value: "color" });
  client.publish(store.getters.getClientID + "/post/state/device/" + deviceId, JSON.stringify(states));
}

export function getAllDevices() {
  client.publish(`${store.getters.getClientID}/request/devices`, '');
}

export function getLogList() {
  client.publish(store.getters.getClientID + "/request/logList", "");
}

export function getLogContent(id: String) {
  client.publish(store.getters.getClientID + "/request/log/" + id, "");
}

export function getStatsDay(day: String) {
  client.publish(store.getters.getClientID + "/request/fullDay/" + day, "");
}

export function getAutomations() {
  client.publish(`${store.getters.getClientID}/request/automations`, "");
}

export function updateAutomation(automation: Automation) {
  client.publish(store.getters.getClientID + "/update/automation/" + automation.id, JSON.stringify({ automation: automation }));
}

export function postAutomation(automation: Automation) {
  client.publish(store.getters.getClientID + "/post/automation", JSON.stringify({ automation: automation }));
}

export function deleteAutomation(id: number) {
  client.publish(store.getters.getClientID + "/delete/automation/" + id, "REQUEST");
}

function isJson(str: string) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}
