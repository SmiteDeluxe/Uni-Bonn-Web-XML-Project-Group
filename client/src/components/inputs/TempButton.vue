<!--Edited by: *** ***-->
<template>
  <div class="temp-control-container">
    <div class="temp-control">
      <div class="control-plus" @click="incTemp()">
        <i class="material-icons control-icon">add</i>
      </div>
      <div class="control-minus" @click="decTemp()">
        <i class="material-icons control-icon">remove</i>
      </div>
    </div>
    <div class="temp-container">
      {{ localtemperature }}°
    </div>
  </div>
</template>

<script>
import { postDeviceInputState } from "@/api";

export default {
  name: "TempButton",
  props: {
    currentValue: Number,
    min: Number,
    max: Number,
    deviceID: String,
    inputID: String,
  },
  data: function() {
    return {
      localtemperature: 0,
    };
  },
  watch: {
    currentValue: {
      handler: function() {
        this.setCurrentTemp();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    setCurrentTemp() {
      this.localtemperature = this.currentValue;
    },
    incTemp() {
      if (this.localtemperature !== this.max) {
        this.localtemperature++;
      }
      setTimeout(() => {
        postDeviceInputState(this.deviceID, {
          states: [{
            inputId: this.inputID,
            value: this.localtemperature,
          }],
        });
      }, 1000);
    },
    decTemp() {
      if (this.localtemperature !== this.min) {
        this.localtemperature--;
      }
      setTimeout(() => {
        postDeviceInputState(this.deviceID, {
          states: [{
            inputId: this.inputID,
            value: this.localtemperature,
          }],
        });
      }, 1000);
    },
  },
};
</script>

<style scoped lang="scss">
.temp-control-container {
  position: absolute;
  top: 0;
  right: 0;
  height: 100px;
  width: 150px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .temp-control {
    background: #C4C4C4;
    height: 100px;
    width: 40px;
    border-radius: 10px;
    position: relative;

    .control-plus {
      position: absolute;
      top: 0;
      width: 40px;
      height: 50px;
      background: transparent;
      border-radius: 10px 10px 0 0;
      border-bottom: 1.5px solid black;
      display: flex;
      justify-content: center;
      align-items: first;
      padding-top: 10px;
      cursor: pointer;

      &:hover {
        box-shadow: 0 0 1px black inset;
      }
    }

    .control-minus {
      position: absolute;
      bottom: 0;
      width: 40px;
      height: 50px;
      background: transparent;
      border-radius: 0 0 10px 10px;
      border-top: 1.5px solid black;
      display: flex;
      justify-content: center;
      align-items: flex-end;
      padding-bottom: 10px;
      cursor: pointer;

      &:hover {
        box-shadow: 0 0 1px black inset;
      }
    }

    .control-icon {
      color: black;
      font-size: 16px;
    }
  }

  .temp-container {
    width: 100px;
    height: 100px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    text-align: center;
    color: #BC3535;
    line-height: 100px;
    font-size: 45px;
    text-shadow: 0 4px 4px rgba(0, 0, 0, 0.5);
  }
}
</style>
