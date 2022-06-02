<!--Edited by: *** ***-->
<template>
  <div class="color-picker-container" :class="{ 'move-right': expandable }">
    <div id="color-picker-container" class="color-picker" :style="{ background: currentColor }">
      <input id="color-picker" type="color" value="#ff0000" @change="printColor($event)">
    </div>
  </div>
</template>

<script>
import { postDeviceInputState } from "@/api";

export default {
  name: "ColorPicker",
  props: {
    min: Number,
    max: Number,
    deviceID: String,
    inputID: Object,
    expandable: Boolean,
    currentValue: Object,
  },
  data: function() {
    return {
      currentColor: "#fdfdfd",
      inputIdRed: "",
      inputIdGreen: "",
      inputIdBlue: "",
      red: 0,
      green: 0,
      blue: 0,
    };
  },
  created() {
    this.setCurrentValue();
    this.inputIdRed = this.inputID.red;
    this.inputIdGreen = this.inputID.green;
    this.inputIdBlue = this.inputID.blue;
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
    setCurrentValue() {
      this.red = this.currentValue.red;
      this.green = this.currentValue.green;
      this.blue = this.currentValue.blue;
      if (this.red === 0 && this.green === 0 && this.blue === 0) {
        this.currentColor = "#ffffff";
      } else {
        this.currentColor = this.rgbToHex();
      }
    },
    rgbToHex() {
      return "#" + ((1 << 24) + (this.red << 16) + (this.green << 8) + this.blue).toString(16).slice(1);
    },
    colorPicker(colors) {
      setTimeout(() => {
        postDeviceInputState(this.deviceID, {
          states: [{
            inputId: this.inputIdRed,
            value: colors.red,
          }, {
            inputId: this.inputIdGreen,
            value: colors.green,
          }, {
            inputId: this.inputIdBlue,
            value: colors.blue,
          }],
        });
      }, 300);
    },
    printColor(event) {
      this.currentColor = event.target.value;
      const color = event.target.value;
      const r = parseInt(color.substr(1, 2), 16);
      const g = parseInt(color.substr(3, 2), 16);
      const b = parseInt(color.substr(5, 2), 16);
      this.colorPicker({ "red": r, "green": g, "blue": b });
    },
  },
};
</script>

<style scoped lang="scss">
.color-picker-container {
  height: 53px;
  width: 53px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 5px;

  .color-picker {
    height: 100%;
    width: 100%;
    border-radius: 10px;
    border: 2px solid black;
    cursor: pointer;
  }

  #color-picker {
    opacity: 0;
    display: block;
    width: 100%;
    height: 100%;
    border: none;
    cursor: pointer;
  }
}

.move-right {
  right: 15px !important;
}
</style>
