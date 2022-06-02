<!--Edited by: *** ***-->
<template>
  <div class="addGroupContainer" @click.self="icons_vis = false">
    <span class="title">New Group</span>
    <form class="form" @submit.prevent="postNewGroup">
      <label class="inputlabel">Name:
        <input type="text" class="textInput" v-model="groupName" required />
      </label>
      <label class="inputlabel">Type:
        <select class="textInput" v-model="groupType" required>
          <option value="room">Room</option>
          <option value="deviceGroup">Device Group</option>
        </select>
      </label>
      <label class="inputlabel">Icon:
        <div class="iconWrapper unselectable" @click="icons_vis=true">
          <i v-if="currentIcon !== ''" :alt="currentIcon" class="material-icons-outlined currentIcon">{{ currentIcon
            }}</i>
        </div>
      </label>
      <div class="subBtn-container">
        <input type="submit" value="Submit" class="subBtn" />
      </div>
    </form>
    <div class="iconSelWrapper">
      <iconSelection v-if="icons_vis" @newIcon="changeIcon" />
    </div>
  </div>
</template>

<script>
import iconSelection from "./iconSelection.vue";
import { postGroup } from "@/api";

export default {
  name: "AddGroup",
  components: { iconSelection },
  props: {},
  data: function() {
    return {
      icons_vis: false,
      currentIcon: "",
      groupType: "",
      groupName: "",
    };
  },
  computed: {},
  methods: {
    // getPath() {
    //     return require("../../assets/icons/"+this.currentIcon+".svg");
    // },
    changeIcon(newIcon) {
      this.icons_vis = false;
      this.currentIcon = newIcon;
    },
    postNewGroup() {
      postGroup(this.groupName, this.groupType, this.currentIcon);
      this.$emit("submitted");
    },
  },
};
</script>

<style scoped lang="scss">
.addGroupContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: transparent;

  .title {
    color: white;
    margin-bottom: 20px;
    font-weight: bold;
  }

  .form {
    display: flex;
    flex-direction: column;
    position: relative;

    .inputlabel {
      font-size: 17px;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 5px;

      .textInput {
        width: 170px;
        border-radius: 2px;
        padding: 7px;
        box-sizing: border-box;
        margin: 5px;
        margin-left: 40px;
        border: none;
        background-color: white;
      }

      .iconWrapper {
        background-color: white;
        height: 32px;
        width: 32px;
        border-radius: 3px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        padding: 3px;
        margin: 30px 5px 5px;

        .currentIcon {
          width: 30px;
          color: #000000;
          font-weight: bold;
          filter: invert(16%) sepia(5%) saturate(711%) hue-rotate(201deg) brightness(93%) contrast(83%);
        }
      }
    }

    .subBtn-container {
      width: 100%;
      padding: 10px;
      display: flex;
      justify-content: center;
      align-items: center;

      .subBtn {
        width: 50%;
        padding: 5px;
        border-radius: 5px;
        font-weight: bold;
        font-size: 17px;
        color: #4b4b4b;
        cursor: pointer;
        border: none;
      }
    }
  }

  .iconSelWrapper {
    position: absolute;
    margin: auto;
  }
}
</style>
