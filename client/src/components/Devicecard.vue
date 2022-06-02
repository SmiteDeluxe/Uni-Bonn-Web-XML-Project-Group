<!--Edited by: *** ***, *** ***, *** ***-->
<template>
  <div class="device_box" :class="{ big: deviceExpanded, offline: deviceOffline }">
    <i class="material-icons-outlined pinned-icon" v-if="!hidePin && (isPinned() || edit) &&!iconSelVis"
       :class="{editing: edit, setPinned: !isPinned()}" @click="edit && setPinned()">
      push_pin
    </i>
    <div class="removeBtn" v-if="edit && !iconSelVis && !groups_vis" @click="removeDevice">
      <img src="/assets/minus.svg" alt="Remove Group" />
    </div>

    <div class="iconSel" v-if="iconSelVis">
      <iconSelection width="290px" height="200px" @newIcon="newIcon" />
      <img src="/assets/close.svg"
           alt="close"
           class="close_btn filter"
           @click.self="iconSelVis = false" />
    </div>

    <div class="selectionWrapper" v-if="groups_vis">
      <Selection title="Groups" width="290px" height="200px" :options="workableGroupArr" @change="changeGroups"
                 @close="groups_vis = false" />
    </div>

    <div v-if="device.template.metadata?.expandable && !edit" id="expand_device" class="expand_device"
         :class="{ rotate: deviceExpanded }"
         @click="deviceExpanded = !deviceExpanded">
      <i class="material-icons-outlined expand_device_icon">expand_more</i>
    </div>

    <div class="device_box_container">
      <div class="device_box_content">
        <div class="device_box_panel">
          <i v-if="!onOffSwitch && deviceActivatable" class="material-icons-outlined device-icon"
             :class="{iconEditing: edit}"
             @click="iconClick">{{ icon }}</i>
          <i v-if="onOffSwitch && deviceActivatable" class="material-icons device-icon" :class="{iconEditing: edit}"
             :style="{ color: iconColor }"
             @click="iconClick">{{ icon }}</i>
          <i v-if="(icon || edit) && !deviceActivatable" @click="iconClick" :class="{ 'pointer': edit, iconEditing: edit }"
             class="material-icons device-icon-simple"
             style="color: #A1A1A1">
            {{icon?.length ? icon :  'help'}}</i>
          <div v-if="!edit">
            <DeviceInput v-for="module in deviceModules" :key="module" :module="module"
                         :expandable="device.template.metadata?.expandable"
                         :currentValueArray="getInputValue"></DeviceInput>
          </div>

          <label class="groupText" @click.prevent="groups_vis = true" v-if="edit">Groups:
            <textarea class="groups textInput" :value="selectedGroupsString" readonly />
          </label>
        </div>

        <div class="expanded-device-container" v-if="deviceExpanded">
          <Stats></Stats>
        </div>

        <input
          :readonly="!edit"
          type="text"
          class="noselect device-name"
          :class="[ !edit ? 'name_normal' : 'name_edit', rgbLamp ? 'shortName' : '' ]"
          :title="device.name"
          v-model.lazy="name"
          @focus="edited = true" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from "vue";
import DeviceInput from "@/components/DeviceInput";
import { client, options, randomClientId, url } from "@/config";
import iconSelection from "@/components/CRUD/iconSelection.vue";
import { deleteDevice, postDeviceInputState, updateDevice } from "@/api";
import Selection from "@/components/CRUD/Selection.vue";
import Stats from "@/components/Statistics/Stats";
import store from "@/store";
import { matchesPattern } from "@/helpers/matchesPattern";
import mqtt from "mqtt";

export default defineComponent({
  name: "Devicecard",
  components: { Stats, DeviceInput, iconSelection, Selection },
  props: {
    device: Object,
    edit: Boolean,
    hidePin: Boolean,
  },
  data: function() {
    return {
      deviceActive: Boolean,
      bigDevice: false,
      deviceExpanded: false,
      deviceActivatable: false,
      deviceOnOffParas: { "id": "", "stateOn": "", "stateOff": "", "value": Boolean },
      rgbLamp: false,
      deviceModules: [],
      name: "",
      edited: false,
      iconSelVis: false,
      icon: "",
      iconColor: "#FFDE2F",
      groups_vis: false,
      selectedGroupIds: [],
      selectedGroupsString: "",
      inputValues: new Map,
      tempClient: undefined,
      deviceOffline: false,
    };
  },
  methods: {
    isPinned() {
      return !!this.selectedGroupIds.find((g) => g === "pinned");
    },
    postChange() {
      updateDevice(this.device.id, this.name, this.icon, this.selectedGroupIds, this.device.template.id, this.device.placeholders);
      this.edited = false;
    },
    setPinned() {
      this.edited = true;
      if (this.selectedGroupIds.includes("pinned")) {
        this.selectedGroupIds.splice(this.selectedGroupIds.indexOf("pinned"), 1);
      } else {
        this.selectedGroupIds.push("pinned");
      }
      this.setInitGroupNames();
    },
    removeDevice() {
      deleteDevice(this.device.id);
    },
    newIcon(icon) {
      this.icon = icon;
      this.iconSelVis = false;
      this.edited = true;
    },
    iconClick() {
      if (this.edit) {
        this.iconSelVis = true;
      } else if (this.deviceActivatable) {
        setTimeout(() => {
          if (this.deviceOnOffParas.value === false) {
            postDeviceInputState(this.device.id, {
              states: [{
                inputId: this.deviceOnOffParas.id,
                value: this.deviceOnOffParas.stateOn,
              }],
            });
          } else {
            postDeviceInputState(this.device.id, {
              states: [{
                inputId: this.deviceOnOffParas.id,
                value: this.deviceOnOffParas.stateOff,
              }],
            });
          }
        }, 300);
      }
    },
    changeGroups(groups) {
      if (!groups.type) {
        this.edited = true;
        this.selectedGroupIds = [];
        this.selectedGroupsString = "";
        let temp = [];
        for (const group of groups) {
          this.selectedGroupIds.push(group.id);
          temp.push(group.name);
        }
        this.selectedGroupsString = temp.join(", ");
      }
    },
    setInitGroupNames() {
      let groupNames = [];
      for (const group of this.$store.getters.getGroups.filter(el => this.selectedGroupIds.includes(el.id))) {
        groupNames.push(group.name);
      }
      this.selectedGroupsString = groupNames.join(", ");
    },
  },
  computed: {
    workableGroupArr() {
      let tempArr = [];
      for (const group of this.$store.getters.getGroups) {
        let temp = { name: group.name, id: group.id, checked: this.selectedGroupIds.includes(group.id) };
        tempArr.push(temp);
      }
      return tempArr;
    },
    onOffSwitch() {
      return this.deviceOnOffParas.value;
    },
    getInputValue() {
      return this.inputValues;
    },
  },
  watch: {
    edit: function(val) {
      this.iconSelVis = false;
      this.groups_vis = false;
      if (!val && this.edited) {
        this.postChange();
      }
    },
  },
  mounted() {
    this.setInitGroupNames();
  },
  created() {
    this.name = this.device.name;
    this.icon = this.device.icon ?? "light";
    this.selectedGroupIds = this.device.groups;

    if (this.device.template.metadata.iconColor) {
      this.iconColor = this.device.template.metadata.iconColor;
    }

    if (this.device.template.inputs) {

      let colorPickerRed = "";
      let colorPickerGreen = "";
      let colorPickerBlue = "";

      for (let value of this.device.template.inputs) {
        if (value.metadata.type === "on-off") {
          this.deviceActivatable = true;
          this.deviceOnOffParas.id = value.id;
          this.deviceOnOffParas.stateOn = value.states[0];
          this.deviceOnOffParas.stateOff = value.states[1];
        } else {
          if (value.metadata.type === "colorPicker") {
            if (value.metadata.color === "red") {
              colorPickerRed = value.id;
            } else if (value.metadata.color === "green") {
              colorPickerGreen = value.id;
            } else if (value.metadata.color === "blue") {
              colorPickerBlue = value.id;
            }
            if (colorPickerRed !== "" && colorPickerGreen !== "" && colorPickerBlue !== "") {
              this.rgbLamp = true;
              this.deviceModules.push({
                "deviceID": this.device.id,
                "inputID": { "red": colorPickerRed, "green": colorPickerGreen, "blue": colorPickerBlue },
                "type": "colorPicker",
                "rangMin": value.range.min,
                "rangMax": value.range.max,
              });
            }
          } else {
            let module = {
              name: value.name,
              deviceID: this.device.id,
              inputID: value.id,
              type: value.metadata.type,
            };
            if (value.range) {
              module.rangMin = value.range.min;
              module.rangMax = value.range.max;
            } else if (module.type === "discrete") {
              module.states = value.states;
            }
            this.deviceModules.push(module);
          }
        }
      }
    }

    // if (this.device.template.outputs) {
    //   for (let value of this.device.template.outputs) {
    //     this.deviceModules.push({
    //       "inputID": value.id,
    //       "type": value.metadata.type,
    //       "rangMin": value.range.min,
    //       "rangMax": value.range.max,
    //     });
    //   }
    // }

    // creating new client for state-listening -> better alternative would be handling it within api.ts but this was the fastest quick&dirty implementation ~***

    /** Setup TempClient and request initial state - gets closed in unmount **/
    const tempOptions = { ...options };
    tempOptions.clientId = randomClientId();
    this.tempClient = mqtt.connect(url, tempOptions);
    this.tempClient.on("connect", () => {
      this.tempClient.subscribe("#");
      client.publish(store.getters.getClientID + "/request/state/device/" + this.device.id, "");
    });

    /** Listening to state-stuff **/
    this.tempClient.on("message", (topic, message) => {

      const gotStateResponse = matchesPattern(topic, store.getters.getClientID + "/response/state/device/" + this.device.id);
      const gotStateBroadcast = matchesPattern(topic, "broadcastClient/broadcast/state/" + this.device.id);

      if (gotStateResponse || gotStateBroadcast) {
        this.deviceOffline = false;
        const response = JSON.parse(message);
        if (Object.keys(response).length !== 0) {
          for (let value of response.states) {
            if (value.inputId === this.deviceOnOffParas.id) {
              this.deviceOnOffParas.value = value.value === this.deviceOnOffParas.stateOn;
            } else {
              this.inputValues.set(value.inputId, value.value);
            }
          }
        } else {
          console.error((gotStateResponse ? "Getting state resulted in error" : "Broadcasted state-info malformed") + ` for deviceId ${this.device.id} - response:`, response);
        }
      }

      // broadcasted device-offline info
      if (matchesPattern(topic, "broadcastClient/broadcast/device/offline/" + this.device.id)) {
        this.deviceOffline = true;
        store.commit("setStatusResponse", {
          entity: "Misc",
          type: "Any",
          status: { statusCode: 400, statusMessage: "Device \"" + this.device.name + "\" seems to be offline" },
        });
      }
    });
  },
  unmounted() {
    this.tempClient?.end();
  },
});
</script>

<style scoped lang="scss">

.big {
  height: 450px !important;
  grid-row: auto/span 2;
  transition: 0.3s;
}

.offline {
  filter: grayscale(0.7);

  * {
    opacity: 0.7;
  }
}

.device_box {
  width: 290px;
  height: 200px;
  background: #36363a;
  border-radius: 10px;
  padding: 28px;
  transition: height 0.3s;
  text-align: left;
  position: relative;

  .pinned-icon {
    color: white;
    text-shadow: 1px 1px 2px black;
    position: absolute;
    top: -10px;
    left: -10px;
    transform: rotate(-45deg);
    font-size: 2.5rem;

    &.editing {
      cursor: pointer;

      &.setPinned {
        opacity: 0.3;
      }

      &:hover {
        opacity: 0.7;
      }
    }
  }

  .removeBtn {
    filter: invert(100%) sepia(3%) saturate(13%) hue-rotate(81deg) brightness(106%) contrast(106%);
    position: absolute;
    top: -10px;
    right: -10px;
    width: 40px;
    cursor: pointer;
  }

  .iconSel {
    z-index: 2;
    position: absolute;
    top: 0;
    left: 0;

    .filter {
      filter: invert(16%) sepia(5%) saturate(711%) hue-rotate(201deg) brightness(93%) contrast(83%);
    }

    .close_btn {
      width: 30px;
      height: 30px;
      top: 10px;
      right: 20px;
      position: absolute;
      cursor: pointer;
      z-index: 3;
    }
  }

  .selectionWrapper {
    position: absolute;
    top: -30px;
    left: 0;
    z-index: 1;
  }

  .expand_device {
    position: absolute;
    right: 0;
    bottom: 0;
    cursor: pointer;
    color: white;
    padding: 5px 5px 0 5px;
    margin-right: -5px;
    margin-bottom: -5px;
    transition: transform .3s ease-in-out;

    .expand_device_icon {
      font-size: 50px;
    }

    &.rotate {
      transform: rotate(180deg);
    }
  }

  .device_box_container {
    display: flex;
    align-items: flex-end;
    width: 100%;
    height: 100%;
    position: relative;

    .device_box_content {
      font-size: 22px;
      color: white;
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      flex-direction: column;

      .device_box_panel {
        width: 100%;
        height: 100%;
        position: relative;
        max-height: 144px;

        .device-icon {
          font-size: 73px;
          margin-left: -14px;
          cursor: pointer;
        }

        .device-icon-simple {
          font-size: 90px;
          margin-left: -14px;
        }

        .iconEditing {
          border: solid #ffffff 2px;
        }

        .groupText {
          position: absolute;
          top: 10px;
          text-align: right;
        }

        .groups {
          resize: none;
          width: 150px;
          height: 70px;
          cursor: pointer;

          &:focus {
            outline: none;
          }
        }
      }

      .expanded-device-container {
        height: 200px;
        margin-top: 15px;
        width: 100%;
        background: rgba(0, 0, 0, 0.5);
        border-radius: 10px;
      }

      .device-name {
        position: absolute;
        bottom: 0;
        left: 0;
        max-width: 234px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 20px;

        &:focus {
          outline: none;
        }
      }

      .name_edit {
        padding-left: 5px;
      }

      .name_normal {
        cursor: default;
        background: none;
        border: none;
        color: white;
        margin-top: 4px;
        width: 170px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }

      .shortName {
        max-width: 175px !important;
      }
    }
  }
}
</style>
