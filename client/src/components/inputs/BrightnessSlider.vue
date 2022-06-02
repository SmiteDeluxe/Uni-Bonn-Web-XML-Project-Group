<!--Edited by: *** ***-->
<template>
  <div class="brightness_input_container">
    <input type="range" :step="scaleStep" class="brightness-selector" :min="min" :max="max" v-model="brightnessValue"
           @change="changeState">
    <div class="range_marks_container">
      <div class="notshow"></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div class="notshow"></div>
    </div>
    <div class="brightness_output">Brightness {{ getCurrentValue }}</div>
  </div>
</template>

<script>
import { postDeviceInputState } from "@/api";

export default {
  name: "BrightnessSlider",
  props: {
    min: Number,
    max: Number,
    deviceID: String,
    inputID: String,
    currentValue: Number,
  },
  data: function() {
    return {
      brightnessValue: 0,
      scaleStep: 0,
    };
  },
  computed: {
    getCurrentValue() {
      return this.brightnessValue;
    },
  },
  created() {
    this.scaleStep = (this.max - this.min) / 10;
    this.brightnessValue = this.currentValue;
  },
  watch: {
    currentValue: {
      handler: function() {
        this.setCurrentValue();
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    changeState() {
      setTimeout(() => {
        postDeviceInputState(this.deviceID, {
          states: [{
            inputId: this.inputID,
            value: this.brightnessValue,
          }],
        });
      }, 300);
    },
    setCurrentValue() {
      this.brightnessValue = this.currentValue;
    },
  },
};
</script>

<style scoped lang="scss">
.brightness_input_container {
  position: absolute;
  top: 0;
  right: 0;

  .brightness-selector {
    -webkit-appearance: none;
    appearance: none;
    overflow: hidden;
    cursor: pointer;
    width: 150px;
    height: 60px;
    background: rgba(196, 196, 196, 0.3);
    border-radius: 10px;

    &::-webkit-slider-runnable-track {
      height: 100%;
    }

    &::-moz-range-track {
      height: 100%;
    }

    &::-webkit-slider-thumb {
      -webkit-appearance: none;
      height: 0;
      width: 0;
      border: 0;
      box-shadow: -100vw 0 0 100vw #4DE6A7;
      box-sizing: border-box;
    }

    &::-moz-range-thumb {
      height: 0;
      width: 0;
      border: 0;
      box-shadow: -100vw 0 0 100vw #4DE6A7;
      box-sizing: border-box;
    }
  }

  .range_marks_container {
    position: absolute;
    top: 0;
    right: 0;
    width: 150px;
    height: 60px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;

    div {
      width: 1px;
      background: rgba(0, 0, 0, 0.4);
      height: 10px;
    }

    .notshow {
      opacity: 0;
    }
  }

  .brightness_output {
    font-size: 13px;
    text-align: center;
    margin-top: -3px;
  }
}
</style>
