//Edited by: *** ***, *** ***, *** ***
import { createStore } from "vuex";

export default createStore({
  state: {
    clientID: "",
    groups: [],
    currentDevices: [],
    users: [],
    currentUser: { deviceRestricitons: [], groupRestrictions: [], id: "", name: "" },
    //currentUserRules: {},
    statusResponse: {
      Group: {Post: {msg: '', code: 0}, Update: {msg: '', code: 0}, Delete: {msg: '', code: 0}},
      Device: {Post: {msg: '', code: 0}, Update: {msg: '', code: 0}, Delete: {msg: '', code: 0}},
      Automation: {Post: {msg: '', code: 0}, Update: {msg: '', code: 0}, Delete: {msg: '', code: 0}},
      Misc: {Any: {msg: '', code: 0}}},
    allDevices: undefined,
    automations: [],
    templates: [],
    currentGroup: "",
    inputState: [],
    logFiles: [],
    currentLogFileContent: "",
    changedDevice: {},
    statsDayString: ''
  },
  mutations: {
    setGroups(state, groups) {
      state.groups = groups.groups;
    },
    setCurrentDevices(state, devices) {
      state.currentDevices = devices.devices;
    },
    setUsers(state, resp) {
      state.users = resp.users;
      if(resp.users.length > 0) state.currentUser = resp.users[0];
    },
    setCurrentUser(state, user) {
      state.currentUser = user;
      //api.getCurrentUserRules(user);
    },
    // setCurrentUserRules(state, rules) {
    //   state.currentUserRules = rules;
    // },
    setClientID(state, clientID) {
      state.clientID = clientID.clientID;
    },
    setAutomations(state, automations) {
      state.automations = automations.automations;
    },
    setAllDevices(state, devices) {
      state.allDevices = devices.devices;
    },
    setStatusResponse(state, data: {entity: 'Group' | 'Device' | 'Automation', type : 'Post' | 'Update' | 'Delete', status: {statusCode: number, statusMessage: string}}) {
        state.statusResponse[data.entity][data.type] = {code: data.status.statusCode, msg: data.status.statusMessage};
    },
    clearStatusResponse(state, data: {entity: 'Group' | 'Device' | 'Automation', type : 'Post' | 'Update' | 'Delete'}) {
      state.statusResponse[data.entity][data.type] = {code: 0, msg: ''};
    },
    setTemplates(state, templates) {
      state.templates = templates;
    },
    setCurrentGroup(state, group) {
      state.currentGroup = group;
    },
    setInputStates(state, inputStates) { //TODO
      console.log(this.getCurrentDevices(state), inputStates);
    },
    setLogFiles(state, logList) {
      state.logFiles = logList;
    },
    setLogFileContent(state, logString) {
      state.currentLogFileContent = logString;
    },
    setStatsDay(state, statsDayString) {
      state.statsDayString = statsDayString;
    }
  },
  modules: {},
  getters: {
    getGroups: (state) => state.groups,
    getCurrentDevices: (state) => state.currentDevices,
    getUsers: (state) => state.users,
    getCurrentUser: (state) => state.currentUser,
    //getCurrentUserRules: (state) => state.currentUserRules,
    getClientID: (state): string => state.clientID,
    getAllStatus: (state): {code: number, msg: string, clearStateData: { type: string, entity: string}}[]  => {
      const msgs: {code: number, msg: string, clearStateData: { type: string, entity: string}}[] = [];
      const anonState = JSON.parse(JSON.stringify(state));
      Object.keys(anonState.statusResponse).forEach((entity) =>
        Object.keys(anonState.statusResponse[entity]).forEach((type) => {
          const entityResponse = anonState.statusResponse[entity][type];
          if(entityResponse.msg) {
            msgs.push({
              code: entityResponse.code,
              msg: entityResponse.msg,
              clearStateData: {type: type, entity: entity}
            });
          }
        })
      );
      return msgs;
    },
    getAutomations: (state) => state.automations,
    getTemplates: (state) => state.templates,
    getCurrentGroup: (state) => state.currentGroup,
    getInputStates: (state) => state.inputState,
    getLogFiles: (state) => state.logFiles,
    getLogFileContent: (state) => state.currentLogFileContent,
    getAllDevices: (state) => state.allDevices,
    getStatsDay: (state) => state.statsDayString,
  },
});
