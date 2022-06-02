<!--***-->
<template>
  <div class="modal">
    <div class="modal-content" v-if="selectedAutomation">
      <span class="close" @click="$emit('closed');$emit('cancel')">&times;</span>

      <h1>
        Automatisierung {{ (selectedAutomation.id ? "bearbeiten" : "hinzufügen") }}
      </h1>
      <h2 v-if="selectedAutomation.id" class="text-center">
        {{ selectedAutomation.id }}
      </h2>


      <form class="form" @submit.prevent="saveAutomation">
        <h3>Basisdaten</h3>
        <div class="input">
          <label for="name">Bezeichnung</label>
          <input id="name" v-model="automation.name" type="text" required>
        </div>
        <div class="input half">
          <label for="active">Status</label>
          <input id="active" ref="activeCb" v-model="automation.active" type="checkbox">
          <span :class="'activation-label text-bold ' + (automation.active ? 'text-success' : 'text-danger')"
                @click="$refs.activeCb.click($event)">
            {{ automation.active ? "Aktiv" : "Inaktiv" }}
          </span>
        </div>
        <div class="input">
          <label for="start">Startdatum <small>(Optional)</small></label>
          <input id="start" v-model="automation.startDate" type="date">
        </div>
        <div class="input">
          <label for="end">Enddatum <small>(Optional)</small></label>
          <input id="end" v-model="automation.endDate" type="date">
        </div>

        <div class="actions">
          <h3>
            Aktionen
            <button class="primary-btn btn-sm float-right mr-20px" @click="addMqttAction()" type="button">
              <i class="text-success">&#43;</i> MQTT-Msg
            </button>
            <button class="primary-btn btn-sm float-right mr-10px" @click="addDeviceStateAction()" type="button">
              <i class="text-success">&#43;</i> Device-State
            </button>
          </h3>
          <p class="text-center text-muted mt-20px" v-if="!automation.actions?.length">
            Keine Aktionen hinterlegt.
          </p>
          <div v-for="(action, index) in automation.actions" :key="action.id" class="action-wrapper">
            <table class="action-table">
              <!--Type-->
              <tr>
                <td>
                  <b>Aktionsart</b>
                </td>
                <td>
                  <div class="input">
                    <b>{{ action.type }}</b>
                  </div>
                </td>
              </tr>
              <!--Name-->
              <tr>
                <td>
                  <b>Name</b>
                </td>
                <td>
                  <div class="input">
                    <input v-model="action.name" type="text" required>
                  </div>
                </td>
              </tr>
              <!--Schedule-->
              <tr>
                <td>
                  <b>CRON Schedule</b>
                </td>
                <td>
                  <div class="input">
                    <input v-model="action.schedule" type="text" required>
                  </div>
                </td>
              </tr>
              <!--Name-->
              <tr>
                <td>
                  <b>Priorität</b>
                </td>
                <td>
                  <div class="input">
                    <input v-model="action.priority" type="range" required>
                  </div>
                </td>
              </tr>
              <!---Device-State-stuff-->
              <template v-if="action.type === 'deviceState'">
                <tr>
                  <td>
                    <b>Gerätestates</b>
                  </td>
                  <td>
                    <button class="primary-btn btn-sm float-right mr-20px" @click="addDeviceState(index);" type="button">
                      <i class="text-success">&#43;</i> Gerät
                    </button>
                  </td>
                </tr>
                <tr v-if="!action.states?.length">
                  <td></td>
                  <td class="text-muted text-center">
                    <p class="mt-10px">
                      Keine Gerätestates hinterlegt
                    </p>
                  </td>
                </tr>
                <template v-for="(state, stateIndex) in action.states" :key="state.deviceId">
                  <tr>
                    <td class="ps-10px">
                      Gerät
                      <button class="primary-btn btn-sm float-right text-danger" title="State löschen" @click="deleteDeviceState(index, stateIndex)" type="button">
                        &times;
                      </button>
                    </td>
                    <td>
                      <div class="input">
                        <select v-model="state.deviceId" :disabled="!!state.states.length" required @change="addDeviceInputState(index, stateIndex)">
                          <!--<option value="" disabled>Bitte wählen</option> funktioniert nicht in Kombination mit der Formvalidierung (required)...-->
                          <option v-for="device in allDevices()" :key="device.id" :value="device.id">{{ device.name }}</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!state.states?.length">
                    <td>
                      State(s)
                      <button class="primary-btn btn-sm float-right text-success" @click="addDeviceInputState(index, stateIndex)" v-if="state.deviceId" type="button">
                        &#43;
                      </button>
                    </td>
                    <td class="text-center text-muted">
                      <div class="mt-10px">Kein Inputstate hinterlegt</div>
                    </td>
                  </tr>
                  <tr v-for="(inputState, inputStateIndex) in state.states" :key="inputState.inputId">
                    <td class="ps-10px v-align-top">
                      <button class="primary-btn btn-sm float-right text-danger" @click="deleteDeviceInputState(index, stateIndex, inputStateIndex)" type="button">
                        &times;
                      </button>
                      <template v-if="inputStateIndex === 0">
                        State(s)
                        <button class="primary-btn btn-sm float-right text-success mr-10px" @click="addDeviceInputState(index, stateIndex)" type="button">
                          &#43;
                        </button>
                      </template>
                    </td>
                    <td>
                      <div class="input float-right">
                        <select v-model="inputState.inputId" required>
                          <!--<option value="" disabled>Bitte wählen</option> funktioniert nicht in Kombination mit der Formvalidierung (required)...-->
                          <option :value="a.id" v-for="a in getDeviceInputs(state.deviceId)" :key="a.id">{{ a.name }}</option>
                        </select>
                        <select v-model="inputState.value" v-if="getDeviceInput(state.deviceId, inputState.inputId)?.states" required>
                          <!--<option value="" disabled>Bitte wählen</option> funktioniert nicht in Kombination mit der Formvalidierung (required)...-->
                          <option :value="a.value ?? a" :key="a.value ?? a" v-for="a in getDeviceInput(state.deviceId, inputState.inputId).states">{{ a.name ?? a }}</option>
                        </select>
                        <input type="range" v-model="inputState.value" v-if="getDeviceInput(state.deviceId, inputState.inputId)?.range" required>
                      </div>
                    </td>
                  </tr>
                </template>
              </template>
              <!--MQTT-Message-stuff-->
              <template v-if="action.type === 'mqttMessage'">
                <tr>
                  <td>
                    <b>MQTT-Topic</b>
                  </td>
                  <td>
                    <div class="input">
                      <input v-model="action.topic" type="text" required>
                    </div>
                  </td>
                </tr>
                <!--MQTT-Message-stuff-->
                <tr>
                  <td>
                    <b>MQTT-Payload</b>
                  </td>
                  <td>
                    <div class="input">
                      <input v-model="action.payload" type="text" required>
                    </div>
                  </td>
                </tr>
              </template>
              <!--delete-button-->
              <tr>
                <td colspan="2">
                  <div class="input">
                    <button class="btn-sm delete-btn delete-action mt-10px" @click="deleteAction(index)" type="button">
                      Aktion löschen
                    </button>
                  </div>
                </td>
              </tr>
              <!--horizontal line (action-splitter)-->
              <tr v-if="index !== (selectedAutomation.actions.length -1)">
                <td colspan="2">
                  <hr class="mb-20px">
                </td>
              </tr>
            </table>
          </div>
        </div>


        <div class="btn-container">
          <button type="submit" class="primary-btn mr-10px">{{ selectedAutomation.id ? "Speichern" : "Hinzufügen" }}</button>
          <button type="button" @click="$emit('closed');$emit('cancel')" class="secondary-btn">Abbrechen</button>
          <button type="button" @click="deleteAutomation()" v-if="!!selectedAutomation.id" class="delete-btn">Löschen</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { deleteAutomation, getAllDevices, postAutomation, updateAutomation } from '@/api';
import { DeviceStateAutomationAction, MqttMessageAutomationAction } from '@/views/Automations/models';
import store from '@/store';

export default defineComponent({
  name: 'AutomationModal',
  created() {
    getAllDevices();
  },
  props: {
    selectedAutomation: Object
  },
  methods: {
    // save the whole automation -> triggered when clicking on "save"-button
    saveAutomation(): void {
      if (this.automation) {
        const automation = JSON.parse(JSON.stringify(this.automation)); // was für ne scheiß Lösung. automation as any oder <any>automation schmeißt nen eslint Fehler todo herausfinden wie mans casten kann
        automation.actions.forEach((a: any) => a.priority = a.priority ? +a.priority : 0);
        if (automation.id) {
          updateAutomation(automation);
        }
        else {
          postAutomation(automation);
        }
        this.$emit('closed');
      }
    },
    // delete the whole automation -> triggered when clicking on "delete"-button
    deleteAutomation(): void {
      if (!this.automation?.id) {
        return;
      }
      deleteAutomation(this.automation.id);
      this.$emit('closed');
    },

    // adds mqtt-message-action to the action-array of selectedAuction
    // -> triggered when clicking on "+ MQTT-Msg"-button
    addMqttAction(): void {
      const action: MqttMessageAutomationAction = {
        id: '',
        name: '',
        payload: '',
        topic: '',
        type: 'mqttMessage',
        schedule: '* * * * *',
        priority: 0
      };
      this.automation?.actions.push(action);
    },
    // adds device-state-action to the action-array of selectedAuction
    // -> triggered when clicking on "+ Device-State"-button
    addDeviceStateAction(): void {
      if(!this.automation) {
        return;
      }
      const action: DeviceStateAutomationAction = {
        id: '',
        name: '',
        type: 'deviceState',
        schedule: '* * * * *',
        priority: 0,
        states: []
      };
      this.automation.actions.push(action);
      this.addDeviceState(this.automation.actions.length - 1);
    },
    // deletes an action from the action-array of selectAuction
    // -> triggered when clicked on "Aktion löschen"-button
    deleteAction(index: number): void {
      this.automation?.actions.splice(index, 1);
    },

    // adds a state-element to the states-array of a specific device-state-action
    // -> triggered when clicking on "+ Device"-button
    addDeviceState(actionIndex: number): void {
      this.automation?.actions[actionIndex].states.push({deviceId: null, states: []});
    },
    // removes a state-element of the states-array of a specific device-state-action
    // -> triggered when clicking on "-"-button next to the device-dropdown
    deleteDeviceState(actionIndex: number, stateIndex: number) {
      this.automation?.actions[actionIndex].states.splice(stateIndex, 1);
    },
    // returns allDevices existing from store - used to display the device-dropdown
    allDevices(): any {
      return store.getters.getAllDevices;
    },
    // returns all inputs of a device - used for displaying the inputs of a device
    getDeviceInputs(deviceId: string): any {
      return store.getters.getAllDevices?.find((d: any) => d.id === deviceId)?.template.inputs;
    },
    // returns the input of a device by deviceId & inputId
    getDeviceInput(deviceId: string, inputId: string): any {
      return store.getters.getAllDevices?.find((d: any) => d.id === deviceId)?.template.inputs.find((i: any) => i.id === inputId);
    },
    // adds an inputState to a given device-state array of an action
    addDeviceInputState(actionIndex: number, deviceStateIndex: number): void {
      this.automation?.actions[actionIndex].states[deviceStateIndex].states.push({inputId: undefined, value: undefined});
    },
    // deletes an inputState of a given device-state array of an action
    deleteDeviceInputState(actionIndex: number, stateIndex: number, inputStateIndex: number): void {
      this.automation?.actions[actionIndex].states[stateIndex].states.splice(inputStateIndex, 1);
    }
  },
  data() {
    return {
      automation: this.selectedAutomation
    };
  }
});
</script>

<style scoped lang="scss">
/* The Modal (background) */
.modal {
  position: fixed; /* Stay in place */
  z-index: 2; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  backdrop-filter: blur(5px);


  /* Modal Content/Box */
  .modal-content {
    color: white;
    background-color: #424246;
    position: relative;
    border-radius: 5px;
    top: 15%;
    margin-left: auto;
    margin-right: auto;
    padding: 20px;
    border: 1px solid #888;
    width: 500px;


    /* The Close Button */
    .close {
      color: #aaa;
      position: absolute;
      right: 15px;
      top: 5px;
      font-size: 28px;
      font-weight: bold;
      transition: all 0.1s;

      &:hover, &:focus {
        color: white;
        text-decoration: none;
        cursor: pointer;
      }
    }

    h1, h2 {
      font-size: 1.3rem;
      text-align: center;
      padding-left: 1rem;
      padding-right: 1rem;
    }

    h3 {
      margin-top: 13px;
      margin-bottom: 5px;
    }

    .half {
      width: 50% !important;
      display: inline-block;
    }

    .mb-20px {
      margin-bottom: 20px;
    }

    .mr-10px {
      margin-right: 10px;
    }

    .mr-20px {
      margin-right: 20px;
    }

    .mt-20px {
      margin-top: 20px;
    }


    .pt-10px {
      margin-top: 10px;
    }

    .mt-10px {
      margin-top: 10px;
    }

    .ps-10px {
      padding-left: 10px;
    }

    .ps-20px {
      padding-left: 10px;
    }

    .v-align-top {
      vertical-align: top;
    }

    .width-50px {
      width: calc(100% - 50px) !important;
    }

    .input {
      padding-left: 20px;
      padding-right: 20px;
      display: inline-block;
      width: 100%;

      &:not(:first-of-type) {
        margin-top: 15px;
      }

      label, input {
        display: block;
        width: 100%;
      }

      select {
        margin-top: 3px;
        padding: 4px 8px;
        width: 100%;
      }

      input[type=text] {
        margin-top: 3px;
        padding: 4px 8px;
      }

      input[type=date] {
        margin-top: 3px;
        padding: 1px 8px;
      }

      input[type=checkbox] {
        width: 30px;
        padding-top: 15px;
        display: inline-block;
        cursor: pointer;
      }

      input[type=range] {
        margin-top: 5px;
      }

      .activation-label {
        cursor: pointer;
      }
    }

    .actions {
      margin-top: 30px;

      .action-wrapper {
        padding-left: 15px;

        .action-table {
          width: 100%;
        }
      }
    }


    // todo refactor
    button {
      font-weight: bold;
      font-size: 1rem;
      cursor: pointer;
      padding: 5px 10px;
      border-radius: 3px;
      transition: all 0.1s;

      &.primary-btn {
        color: #4b4b4b;
        background: white;
        border: 1px solid black;

        &:hover {
          background: #e3e3e3;
          color: #4b4b4b;
        }
      }

      &.secondary-btn {
        margin-right: 20px;
        color: white;
        background: transparent;
        border: 1px solid white;

        &:hover {
          background: white;
          color: #4b4b4b;
        }
      }

      &.delete-btn {
        border-color: red;
        background: transparent;
        color: red;
        float: right;

        &:hover {
          background: red;
          color: white;
        }
      }

      &:active:not(.delete-btn) {
        background: #d5d5d5 !important;
        color: #4b4b4b;
      }

      &.btn-sm {
        font-size: 0.8rem;
        padding: 3px 6px;
      }
    }

    .btn-container {
      margin-top: 25px;
      text-align: center;

    }
  }
}
</style>
