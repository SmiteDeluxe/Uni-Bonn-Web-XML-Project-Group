<!--Edited by: *** ***-->
<template>
  <div class="input_container">
    <label>{{ name }}</label>
    <select v-model="value" @change="changeState" v-if="states.length > 2">
      <option v-for="state of states" :key="state" :value="state.value ?? state">{{ state.name ?? state }}</option>
    </select>
    <div v-if="states.length === 2" class="radio-container">
      <template v-for="state of states" :key="state">
        <label>
          <input type="radio" :value="state.value ?? state" :name="name" v-model="value" @change="changeState">
          {{ state.name ?? state }}
        </label>
      </template>
    </div>
  </div>
</template>

<script>
import { postDeviceInputState } from "@/api";

export default {
  name: "GenericDiscrete",
  props: {
    name: String,
    states: Array,
    deviceID: String,
    inputID: String,
    currentValue: String,
  },
  data: function () {
    return {
      value: 0,
    };
  },
  created() {
    this.value = this.currentValue;
  },
  watch: {
    currentValue: function(newVal, oldVal) {
      this.value = newVal;
    }
  },
  methods: {
    changeState() {
      setTimeout(() => {
        postDeviceInputState(this.deviceID, {
          states: [{
            inputId: this.inputID,
            value: this.value,
          }],
        });
      }, 300);
    },
  },
};
</script>

<style scoped lang="scss">
.input_container {
  display: inline-block;
  width: 100%;

  label {
    text-align: left;
    display: inline-block;
    font-size: 12px;
    width: 50%;
  }

  .radio-container {
    display: inline-block;
    position: relative;
    width: 50%;
    z-index: 1;

    label {
      display: inline-block;
      width: 50%;
      font-size: 15px;
    }
  }

  select {
    width: 50%;
  }
}
</style>
