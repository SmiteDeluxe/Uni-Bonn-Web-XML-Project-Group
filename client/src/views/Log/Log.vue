<!--Edited by: *** ***-->
<template>
  <Header :title="'Log'"></Header>
  <div class="content-container">
    <div class="log-container">
      <div class="log-select-container">
        <div v-for="logFile in logFileArray" :key="logFile" class="log-object" @click="getLogContent(logFile)">
          <i class="material-icons file-icon">description</i>
          Log from {{ logFile.date }}
        </div>
      </div>
      <div class="log-output-container">
        <div class="log-output">
          <div class="log-output-header">
            <div class="log-output-header-text">Log from
              <transition name="fade" mode="out-in">
                <div style="display: inline-block" :key="logDate">{{ logDate }}</div>
              </transition>
            </div>
            <div class="log-level-container">
              <div>Select log level:</div>
              <div class="log-level-button debug-button" @click="changeLogArray('ALL')">ALL</div>
              <div class="log-level-button info-button" @click="changeLogArray('INFO')">INFO</div>
              <div class="log-level-button warning-button" @click="changeLogArray('WARN')">WARN</div>
              <div class="log-level-button error-button" @click="changeLogArray('ERROR')">ERROR</div>
              <div class="log-level-button fatal-button" @click="changeLogArray('FATAL')">FATAL</div>
            </div>
          </div>
          <transition name="fade" mode="out-in">
            <div :key="logArray" class="log-output-content">
              <template v-for="(logObject, firstIndex) in logArray" :key="logObject">
                <div class="log-output-line" v-for="(logEntry, index) in logObject" :key="logEntry">
                  <div v-if="index === 0" class="log-output-line-time" style="width: 75px;">{{ firstIndex }}</div>
                  <div v-if="index !== 0" class="log-output-line-time" style="width: 75px;">
                    <div class="log-output-line-seperator"></div>
                  </div>
                  <div class="log-output-level-container" v-html="logEntry.logLevel"></div>
                  <div class="small-padding log-output-message">
                    <div>{{ logEntry.logMessage }}</div>
                  </div>
                </div>
              </template>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header";
import { getLogContent, getLogList, getUsers } from "@/api";

export default {
  name: "Log",
  components: { Header },
  data: function() {
    return {
      logArray: Array,
      logArrayAll: Array,
      logArrayInfo: Array,
      logArrayWarning: Array,
      logArrayError: Array,
      logArrayFatal: Array,
      logFileArray: [],
      logDate: "",
    };
  },
  methods: {
    changeLogArray(logLevel) {
      switch (logLevel) {
        case "ALL":
          this.logArray = this.logArrayAll;
          break;
        case "INFO":
          this.logArray = this.logArrayInfo;
          break;
        case "WARN":
          this.logArray = this.logArrayWarning;
          break;
        case "ERROR":
          this.logArray = this.logArrayError;
          break;
        case "FATAL":
          this.logArray = this.logArrayFatal;
          break;
      }
    },
    getLogContent(logFile) {
      getLogContent(logFile.id);
      this.logDate = logFile.date;

      setTimeout(() => {
        let logString = this.$store.getters.getLogFileContent;
        let logArray = logString.log.split("\r\n");

        let logArrayAll = {};
        let logArrayInfo = {};
        let logArrayWarning = {};
        let logArrayError = {};
        let logArrayFatal = {};

        logArray.forEach(value => {
          if (value !== "") {
            const splitString = value.split(" - ");
            let timeValue = splitString[0].match(/(?<=T).+?(?=\.)/)[0];
            let logLevel = splitString[1];
            let logMessage = splitString[2];

            switch (logLevel) {
              case "INFO":
                logLevel = "<p style=\"color: #1abc9c; display: inline;\">" + logLevel + "</p>";
                if (logArrayInfo[timeValue]) {
                  logArrayInfo[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayInfo[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                if (logArrayAll[timeValue]) {
                  logArrayAll[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayAll[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                break;
              case "WARN":
                logLevel = "<p style=\"color: #f1c40f; display: inline;\">" + logLevel + "</p>";
                if (logArrayWarning[timeValue]) {
                  logArrayWarning[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayWarning[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                if (logArrayAll[timeValue]) {
                  logArrayAll[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayAll[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                break;
              case "ERROR":
                logLevel = "<p style=\"color: #c0392b; display: inline;\">" + logLevel + "</p>";
                if (logArrayError[timeValue]) {
                  logArrayError[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayError[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                if (logArrayAll[timeValue]) {
                  logArrayAll[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayAll[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                break;
              case "FATAL":
                logLevel = "<p style=\"color: #441510; display: inline;\">" + logLevel + "</p>";
                if (logArrayFatal[timeValue]) {
                  logArrayFatal[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayFatal[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                if (logArrayAll[timeValue]) {
                  logArrayAll[timeValue].push({ logLevel: logLevel, logMessage: logMessage });
                } else {
                  logArrayAll[timeValue] = [{ logLevel: logLevel, logMessage: logMessage }];
                }
                break;
            }
          }
        });

        this.logArray = logArrayAll;
        this.logArrayAll = logArrayAll;
        this.logArrayInfo = logArrayInfo;
        this.logArrayWarning = logArrayWarning;
        this.logArrayError = logArrayError;
        this.logArrayFatal = logArrayFatal;
      }, 300);
    },
  },
  created() {
    if (this.$store.getters.getUsers.length === 0) getUsers();
    if (this.$store.getters.getGroups.length === 0) {
      getLogList();
      setTimeout(() => {
        const logFiles = this.$store.getters.getLogFiles;
        logFiles.forEach(value => {
          const temp = value.split("-");
          const date = temp[2] + "." + temp[1] + "." + temp[0];
          this.logFileArray.push({ id: value, date: date });
        });
      }, 100);
    } else {
      const logFiles = this.$store.getters.getLogFiles;
      logFiles.forEach(value => {
        const temp = value.split("-");
        const date = temp[2] + "." + temp[1] + "." + temp[0];
        this.logFileArray.push({ id: value, date: date });
      });
    }
    setTimeout(() => {
      this.logFileArray.reverse();
      this.getLogContent(this.logFileArray[0]);
    }, 100);
  },
};
</script>

<style scoped lang="scss">
.header {
  position: sticky;
  height: 85px;

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

  .log-container {
    width: 75%;
    height: 100%;
    border-radius: 20px;
    display: flex;
    justify-content: center;
    align-items: center;

    @media screen and (max-width: 1200px) {
      width: 100%;
    }

    .log-select-container {
      height: 100%;
      width: 20%;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.1);
      margin-right: 10px;
      padding: 10px;
      overflow: auto;
      -ms-overflow-style: none;
      scrollbar-width: none;

      @media screen and (max-width: 992px) {
        width: 35%;
      }

      &::-webkit-scrollbar {
        display: none;
      }

      .log-object {
        width: 100%;
        height: 60px;
        background: white;
        border-radius: inherit;
        padding: 10px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        font-weight: 600;
        margin-bottom: 5px;
        cursor: pointer;
        box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;

        .file-icon {
          font-size: 36px;
          padding-right: 20px;
        }

        .log-object-bottom {
          height: 60%;
          width: 100%;
          padding: 10px;
        }
      }
    }

    .log-output-container {
      height: 100%;
      width: 80%;
      border-radius: 20px;
      background: rgba(0, 0, 0, 0.1);
      padding: 10px;

      @media screen and (max-width: 992px) {
        width: 65%;
      }

      .fade-enter-active {
        transition: all 0.3s ease;
      }

      .fade-leave-active {
        transition: all 0.3s ease;
      }

      .fade-enter-from {
        opacity: 0;
      }

      .fade-leave-to {
        opacity: 0;
      }

      .log-output {
        width: 100%;
        height: 100%;
        border-radius: inherit;
        background: #0f1f2c;
        color: #91a8b9;
        padding-bottom: 5px;

        .log-output-header {
          width: 100%;
          height: 70px;
          padding: 10px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.3);
          display: flex;
          justify-content: space-between;
          align-items: center;
          overflow: auto;

          .log-output-header-text {
            padding: 0 20px 0 10px;
            font-weight: 600;
            font-size: 20px;
            margin-right: auto;
            width: 250px;
          }

          .log-level-container {
            width: 500px;
            display: flex;
            justify-content: center;
            align-items: center;

            .log-level-button {
              width: 80px;
              height: 40px;
              line-height: 40px;
              margin: 0 5px;
              border-radius: 10px;
              font-size: 14px;
              text-align: center;
              color: white;
              font-weight: 600;
              cursor: pointer;

              &.debug-button {
                background: rgba(38, 96, 164, 0.5);
                border: 1px solid #2660A4;
              }

              &.info-button {
                background: rgba(26, 188, 156, 0.5);
                border: 1px solid #1abc9c;
              }

              &.warning-button {
                background: rgba(241, 196, 15, 0.5);
                border: 1px solid #f1c40f;
              }

              &.error-button {
                background: rgba(192, 57, 43, 0.5);
                border: 1px solid #c0392b;
              }

              &.fatal-button {
                background: rgba(68, 21, 16, 0.5);
                border: 1px solid #441510;
              }

            }
          }
        }

        .log-output-content {
          width: 100%;
          height: 90%;
          overflow: auto;
          padding-bottom: 5px;

          .log-output-line {
            line-height: 20px;
            padding: 5px 10px 5px 5px;
            display: flex;
            align-items: center;

            .log-output-line-time {
              display: flex;
              flex-basis: 75px;
              flex-grow: 0;
              flex-shrink: 0;
              justify-content: center;
              align-items: center;
            }

            .log-output-line-seperator {
              border: 1px solid #91a8b9;
              height: 20px;
              width: 0;
            }

            .log-output-level-container {
              display: flex;
              flex-basis: 75px;
              flex-grow: 0;
              flex-shrink: 0;
              justify-content: center;
              align-items: center;
            }

            .log-output-message {
              white-space: nowrap;

              div {
                width: 100%;
                padding: 0 5px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
