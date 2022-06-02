<!--Edited by: *** ***-->
<template>
  <BrightnessSlider v-if="module.type === 'brightnessSlider'" :min="module.rangMin" :max="module.rangMax"
                    :deviceID="module.deviceID" :inputID="module.inputID"
                    :currentValue="currentValue"></BrightnessSlider>

  <ColorPicker v-if="module.type === 'colorPicker'" :min="module.rangMin" :max="module.rangMax"
               :deviceID="module.deviceID" :inputID="module.inputID" :expandable="expandable"
               :currentValue="currentValueObject"></ColorPicker>

  <TempButton v-if="module.type === 'temp-button'" :min="module.rangMin" :max="module.rangMax"
              :deviceID="module.deviceID" :inputID="module.inputID" :currentValue="currentValue"></TempButton>

  <Timer :progress="progress" v-if="module.type === 'timer'"></Timer>

  <GenericDiscrete v-if="module.type === 'discrete'" :states="module.states"
                   :name="module.name"
                   :deviceID="module.deviceID" :inputID="module.inputID"
                   :currentValue="currentStringValue ?? currentValue">
  </GenericDiscrete>

  <gaugeChart v-if="module.type === 'gauge'" :min="module.rangMin" :max="module.rangMax"
              :currentValue="currentValue"></gaugeChart>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BrightnessSlider from "@/components/inputs/BrightnessSlider.vue";
import ColorPicker from "@/components/inputs/ColorPicker.vue";
import TempButton from "@/components/inputs/TempButton.vue";
import Timer from "@/components/inputs/Timer.vue";
import GaugeChart from "@/components/inputs/gaugeChart.vue";
import GenericDiscrete from "@/components/inputs/GenericDiscrete.vue";

export default defineComponent({
  name: "DeviceInput",
  components: { GenericDiscrete, GaugeChart, Timer, TempButton, ColorPicker, BrightnessSlider },
  props: {
    module: Object,
    expandable: Boolean,
    currentValueArray: Map
  },
  data: function() {
    return {
      progress: 0,
      currentValue: 0,
      currentStringValue: '',
      currentValueObject: {}
    };
  },
  methods: {
    assignValues() {
      if (this.module && this.currentValueArray) {


        //workaround für nodered
        if(this.module.deviceID === 'powerStrip') {
          const entry = [... this.currentValueArray]?.find((d: any) => d[0] === this.module?.inputID);
          this.currentStringValue = entry ? [...entry][1] + '' : 'OFF';
          console.log(this.currentStringValue, this.module.inputID);
        }

        if (typeof this.module.inputID === "string") {
          const inputValue = this.currentValueArray.get(this.module.inputID);
          if (inputValue === null || inputValue === undefined) {
            this.currentValue = this.module.rangMin;
          } else {
            this.currentValue = Number(inputValue);
          }
        } else {
          let red = this.currentValueArray.get(this.module.inputID.red);
          let green = this.currentValueArray.get(this.module.inputID.green);
          let blue = this.currentValueArray.get(this.module.inputID.blue);

          if (red === null || red === undefined) red = this.module.rangMin;
          if (green === null || green === undefined) green = this.module.rangMin;
          if (blue === null || blue === undefined) blue = this.module.rangMin;

          this.currentValueObject = { "red": red, "green": green, "blue": blue };
        }

      }
    }
  },
  computed: {
    getCurrentValue() {
      return this.currentValue;
    }
  },
  watch: {
    currentValueArray: {
      handler: function() {
        this.assignValues();
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.assignValues();
  }
});
</script>

<style scoped lang="scss"></style>
