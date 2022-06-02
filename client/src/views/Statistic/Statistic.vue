<!--Edited by: *** ***-->
<template>
  <Header :title="'Statistics'"></Header>
  <div class="content-container">
    <div class="stats-container">
      <div class="stats-content-container">
        <div class="stats-content">
          <div class="stats-header">
            <div class="stats-header-time-selection">
              <div class="text">Zeitabschnitt:</div>
              <div class="button green-button" @click="changeTimeStep('hour')">60min</div>
              <div class="button blue-button" @click="changeTimeStep('half')">30min</div>
              <div class="button orange-button" @click="changeTimeStep('quarter')">15min</div>
            </div>
            <div class="stats-header-date-selection">
              <div class="selected-date">{{ getSelectedDate }}</div>
              <i class="material-icons-outlined">calendar_month</i>
              <input type="date" class="datepicker" @change="changeDate($event)" />
            </div>
          </div>
          <div class="stats-body">
            <template v-for="timeStep in currentTimeStep" :key="timeStep">
              <div class="stats-row">
                <div class="stats-row-separator"></div>
                <div class="stats-row-time">{{ timeStep }}</div>
                <div class="stats-row-content">
                  <template v-for="event in eventsArray[timeStep]" :key="event">
                    <div class="stats-event-container" :title="event.deviceId">
                      <div class="stats-event">
                        <div class="stats-event-color" :style="{'background': deviceColors[event.deviceId]}"></div>
                        <div class="stats-event-content">
                          <div class="stats-event-content-deviceid">{{ event.inputId }}</div>
                          <div class="stats-event-content-value">{{ event.value }}</div>
                          <div class="stats-event-content-time">
                            <div>{{ event.time }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header";
import { getStatsDay } from "@/api";

export default {
  name: "Statistic",
  components: { Header },
  data: function() {
    return {
      currentTimeStep: [],
      eventsArray: [],
      deviceColors: [],
      selectedDate: "",
      statsArray: [],
    };
  },
  methods: {
    changeTimeStep(step) {
      let result = [];
      switch (step) {
        case "hour":
          for (let i = 0; i < 24; i++) {
            if (i === 0) {
              result.push("00:00");
            } else if ((Math.log(i) * Math.LOG10E + 1 | 0) === 1) {
              result.push("0" + i + ":00");
            } else {
              result.push(i + ":00");
            }
          }
          break;
        case "half":
          for (let i = 0; i < 24; i++) {
            if (i === 0) {
              result.push("00:00");
              result.push("00:30");
            } else if ((Math.log(i) * Math.LOG10E + 1 | 0) === 1) {
              result.push("0" + i + ":00");
              result.push("0" + i + ":30");
            } else {
              result.push(i + ":00");
              result.push(i + ":30");
            }
          }
          break;
        case "quarter":
          for (let i = 0; i < 24; i++) {
            if (i === 0) {
              result.push("00:00");
              result.push("00:15");
              result.push("00:30");
              result.push("00:45");
            } else if ((Math.log(i) * Math.LOG10E + 1 | 0) === 1) {
              result.push("0" + i + ":00");
              result.push("0" + i + ":15");
              result.push("0" + i + ":30");
              result.push("0" + i + ":45");
            } else {
              result.push(i + ":00");
              result.push(i + ":15");
              result.push(i + ":30");
              result.push(i + ":45");
            }
          }
          break;
      }
      this.currentTimeStep = result;
      this.fillArray();
    },
    getRandomColor() {
      let letters = "0123456789ABCDEF";
      let color = "#";
      for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
    },
    setDeviceColors(eventArray) {
      let deviceColors = [];
      eventArray.forEach(value => {
        const statTempArray = value.split(",");
        let statDeviceId = statTempArray[1];

        if (!deviceColors[statDeviceId]) {
          deviceColors[statDeviceId] = this.getRandomColor();
        }
      });

      this.deviceColors = deviceColors;
    },
    changeDate(event) {
      const date = event.target.value.split("-");
      this.selectedDate = date[0] + "-" + date[1] + "-" + date[2];
      this.changeStatsContent();
    },
    changeStatsContent() {
      getStatsDay(this.selectedDate);

      setTimeout(() => {
        let statsString = this.$store.getters.getStatsDay;
        if (statsString !== "") {
          this.statsArray = statsString.statistics.split("\n");
          this.setDeviceColors(this.statsArray);
        }
        this.fillArray();
      }, 300);
    },
    fillArray() {
      let result = [];
      let resultLength = 0;

      this.currentTimeStep.forEach((time, index) => {
        result[time] = [];
        resultLength = index + 1;
      });

      this.statsArray.forEach(value => {
        if (value !== "") {
          const statTempArray = value.split(",");
          let timeValue = statTempArray[0].match(/(?<=T).+?(?=\.)/)[0];
          let timeArray = timeValue.split(":");
          const eventHour = parseInt(timeArray[0]);
          const eventMinute = parseInt(timeArray[1]);
          let statDeviceId = statTempArray[1];
          let statInputId = statTempArray[2];
          let statValue = statTempArray[3];

          const statEventObject = {
            "time": timeValue,
            "deviceId": statDeviceId,
            "inputId": statInputId,
            "value": statValue,
          };

          this.currentTimeStep.some(time => {
            const tempTimeArray = time.split(":");
            const hour = parseInt(tempTimeArray[0]);
            const minute = parseInt(tempTimeArray[1]);

            if (eventHour >= hour && eventHour < ((hour + 1) % 24)) {
              if (resultLength === 24) {
                result[time].push(statEventObject);
                return true;
              } else if (resultLength === 48) {
                if (minute === 30) {
                  if (eventMinute >= minute) {
                    result[time].push(statEventObject);
                    return true;
                  }
                } else {
                  if (eventMinute >= minute && eventMinute < ((minute + 30) % 60)) {
                    result[time].push(statEventObject);
                    return true;
                  }
                }
              } else {
                if (minute === 45) {
                  if (eventMinute >= minute) {
                    result[time].push(statEventObject);
                    return true;
                  }
                } else {
                  if (eventMinute >= minute && eventMinute < ((minute + 15) % 60)) {
                    result[time].push(statEventObject);
                    return true;
                  }
                }
              }
            }
          });
        }
      });
      this.eventsArray = result;
    },
    getTodaysDate() {
      let today = new Date();
      let day = String(today.getDate()).padStart(2, "0");
      let month = String(today.getMonth() + 1).padStart(2, "0");
      let year = today.getFullYear();

      return year + "-" + month + "-" + day;
    },
  },
  computed: {
    getSelectedDate() {
      return this.selectedDate;
    },
  },
  created() {
    this.changeTimeStep("hour");
    this.selectedDate = this.getTodaysDate();
    this.changeStatsContent();
  },
};
</script>

<style scoped lang="scss">
.header {
  height: 85px;
  position: sticky;

  @media screen and (max-height: 576px), (max-width: 576px) {
    height: 65px;
  }
}

.content-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px;
  width: 100%;
  height: calc(100% - 85px);

  @media screen and (max-height: 576px), (max-width: 576px) {
    height: calc(100% - 65px);
  }

  .stats-container {
    width: 75%;
    height: 100%;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    @media screen and (max-height: 768px), (max-width: 768px) {
      width: 100%;
    }

    .stats-content-container {
      height: 100%;
      width: 100%;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.1);
      margin-right: 10px;
      padding: 15px;

      .stats-content {
        height: 100%;
        width: 100%;
        border-radius: inherit;
        background: #0f1f2c;

        .stats-header {
          width: 100%;
          height: 10%;
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          border-top-left-radius: inherit;
          border-top-right-radius: inherit;
          display: flex;
          align-items: center;
          justify-content: space-between;
          overflow: auto;

          .stats-header-time-selection {
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            color: rgba(255, 255, 255, 0.7);
            font-weight: 600;

            .text {
              padding: 0 10px;
            }

            .button {
              padding: 10px;
              border: 1px solid white;
              margin-right: 5px;
              border-radius: 5px;
              cursor: pointer;
            }

            .green-button {
              background: rgba(19, 111, 99, 0.5);
              border: 1px solid #136F63;
            }

            .orange-button {
              background: rgba(187, 107, 0, 0.5);
              border: 1px solid #BB6B00;
            }

            .blue-button {
              background: rgba(92, 200, 255, 0.5);
              border: 1px solid #5CC8FF;
            }
          }

          .stats-header-date-selection {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100%;
            padding: 10px;
            position: relative;

            .selected-date {
              color: rgba(255, 255, 255, 0.7);
              font-weight: 600;
              padding: 10px 20px;
              font-size: 18px;
            }

            i {
              //color: #E0CA3C;
              color: rgb(177, 29, 29);
              font-size: 40px;
              padding-right: 5px;
            }

            .datepicker {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              opacity: 0;
              cursor: pointer;

              &::-webkit-calendar-picker-indicator {
                position: absolute;
                top: 0;
                width: 100%;
                height: 100%;
                left: 0;
                margin: 0;
                padding: 0;
                cursor: pointer;
              }
            }
          }
        }

        .stats-body {
          width: 100%;
          height: 90%;
          border-bottom-left-radius: inherit;
          border-bottom-right-radius: inherit;
          overflow: auto;
          cursor: default;

          .stats-row {
            width: 100%;
            height: 100px;
            display: flex;
            align-items: center;
            position: relative;

            .stats-row-separator {
              position: absolute;
              left: 20px;
              bottom: -1px;
              height: 2px;
              background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.3) 25%, rgba(255, 255, 255, 0.3) 75%, rgba(255, 255, 255, 0) 100%);
              width: 300px;
              border-radius: 2px;
            }

            .stats-row-time {
              display: flex;
              flex-basis: 100px;
              flex-grow: 0;
              flex-shrink: 0;
              justify-content: center;
              align-items: center;
              height: 100%;
              color: #91a8b9;
              font-size: 25px;
            }

            .stats-row-content {
              flex-grow: 1;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: flex-start;
              padding: 5px 10px;

              .stats-event-container {
                height: 100%;
                width: 200px;
                padding: 5px;
                display: flex;
                justify-content: center;
                align-items: center;

                .stats-event {
                  background: rgba(255, 255, 255, 0.8);
                  width: 100%;
                  height: 100%;
                  border-radius: 15px;
                  position: relative;
                  padding: 10px 10px 5px 10px;

                  .stats-event-color {
                    position: absolute;
                    top: 10px;
                    bottom: 10px;
                    left: 10px;
                    width: 5px;
                    border-radius: 5px;
                  }

                  .stats-event-content {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    padding-left: 15px;
                    font-weight: 600;

                    .stats-event-content-deviceid {
                      flex-grow: 1;
                      color: rgba(0, 0, 0, 0.5);
                      font-size: 10px;
                      display: flex;
                      align-items: center;
                    }

                    .stats-event-content-value {
                      flex-grow: 2;
                      color: black;
                      display: flex;
                      align-items: center;
                      font-size: 24px;
                      padding-left: 10px;
                    }

                    .stats-event-content-time {
                      flex-grow: 1;
                      color: rgba(255, 255, 255, 0.8);
                      display: flex;
                      align-items: center;
                      justify-content: flex-end;
                      font-size: 10px;

                      div {
                        padding: 2px 5px;
                        background: rgba(0, 0, 0, 0.5);
                        border-radius: 5px;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

</style>
