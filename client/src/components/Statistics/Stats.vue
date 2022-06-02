<!-- Edited by: *** *** -->
<template>
  <div class="stats-container">
    <div class="stats-top">
      <div class="stats-divider"></div>
      <div class="stats-top-select-container" @click="lastDate">
        <i class="material-icons navigate-icon">navigate_before</i>
      </div>
      <div class="stats-top-text-container">Daily Changes
        <i class="material-icons navigate-icon-dropdown">arrow_drop_down</i>
      </div>
      <div class="stats-top-select-container" @click="nextDate">
        <i class="material-icons navigate-icon">navigate_next</i>
      </div>
    </div>
    <div class="stats-bottom">
      <StatsOptions></StatsOptions>
    </div>
  </div>
</template>

<script>
import StatsOptions from "@/components/Statistics/StatsOptions";

export default {
  name: "Stats",
  components: { StatsOptions },
  data: function() {
    return {
      firstDate: "",
      secondDate: "",
      timeMutator: 1,
      statArray: {},
    };
  },
  created() {
    const testStatString = "2022-02-01 - 2022-02-01T14:06:00.023+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:06:00.027+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:07:00.011+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:08:00.020+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:08:00.022+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:09:00.008+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:10:00.016+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:10:00.027+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:11:00.008+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:14:00.015+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:14:00.028+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:15:00.021+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:16:00.014+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:16:00.019+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:17:00.012+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:18:00.019+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:18:00.037+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:20:00.012+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:20:00.025+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:21:00.022+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:23:00.011+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:24:00.020+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:24:00.022+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:25:00.025+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:26:00.007+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:26:00.012+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:27:00.014+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:28:00.023+01:00,kitchenLamp,turn,on\n2022-02-01 - 2022-02-01T14:28:00.027+01:00,kitchenLamp,turn,on\n2022-01-31 - 2022-01-31T14:28:00.027+01:00,kitchenLamp,turn,on";
    let statsArray = testStatString.split("\n");

    this.firstDate = this.getDates();
    this.secondDate = this.getDates(1);

    let statsDeviceArray = {};

    statsArray.forEach(stats => {
      let statValue = stats.split(",");
      let dateTime = statValue[0].split(" - ");
      let date = dateTime[0];
      // let time = dateTime[1];
      let deviceId = statValue[1];
      let inputId = statValue[2];
      let value = statValue[3];

      if (statsDeviceArray[date]) {
        statsDeviceArray[date].push({ deviceId: deviceId, inputId: inputId, value: value });
      } else {
        statsDeviceArray[date] = [{ deviceId: deviceId, inputId: inputId, value: value }];
      }
    });

    this.statArray = statsDeviceArray;
  },
  methods: {
    getDates(constructor = 0) {
      const today = new Date(new Date().getTime() - (24 * 60 * 60 * 1000) * constructor);
      const day = String(today.getDate()).padStart(2, "0");
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const year = today.getFullYear();
      return year + "-" + month + "-" + day;
    },
    nextDate() { //TODO
      console.log(this.timeMutator);
      if (this.timeMutator > 1) {
        this.secondDate = this.firstDate;
        this.firstDate = this.getDates(this.timeMutator - 2);
        this.timeMutator -= 2;
      } else {
        this.secondDate = this.getDates(1);
        this.firstDate = this.getDates();
      }
    },
    lastDate() {
      this.firstDate = this.secondDate;
      this.secondDate = this.getDates(this.timeMutator + 1);
      this.timeMutator++;
    },
  },
  computed: {
    getCountFirstDate() {
      if (this.statArray[this.firstDate]) {
        return this.statArray[this.firstDate].length;
      } else {
        return 0;
      }
    },
    getCountSecondDate() {
      if (this.statArray[this.secondDate]) {
        return this.statArray[this.secondDate].length;
      } else {
        return 0;
      }
    },
  },
};
</script>

<style scoped lang="scss">
.stats-container {
  height: 100%;
  width: 100%;
  border-radius: inherit;

  .stats-top {
    width: 100%;
    height: 40px;
    border-top-left-radius: inherit;
    border-top-right-radius: inherit;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;

    .stats-divider {
      position: absolute;
      left: 5%;
      bottom: 0;
      width: 90%;
      border-radius: 1px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stats-top-select-container {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2px;
      cursor: pointer;
    }

    .navigate-icon {
      font-size: 32px;
    }

    .navigate-icon-dropdown {
      font-size: 32px;
      margin-right: -15px;
    }

    .stats-top-text-container {
      height: 100%;
      width: 100%;
      font-size: 18px;
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  }

  .stats-bottom {
    width: 100%;
    height: 160px;
    border-bottom-left-radius: inherit;
    border-bottom-right-radius: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
