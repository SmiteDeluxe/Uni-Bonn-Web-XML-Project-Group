<!--Edited by: *** ***-->
<template>
  <div class="addDeviceContainer" @click.self="groups_vis = false; icons_vis = false">
    <span class="title">New Device</span>
    <form class="form" @submit.prevent="postDevice">
      <label class="inputlabel">Name:
        <input type="text" class="textInput" v-model="deviceName" required />
      </label>
      <label class="inputlabel">Type:
        <select class="textInput" v-model="deviceTemplate" required @change="placeholders = {}">
          <option v-for="temp in templates" :key="temp.id" :value="temp.id">{{ temp.name }}</option>
        </select>
      </label>
      <template v-if="deviceTemplate">
        <label class="inputlabel" v-for="pb of templates?.find((t) => t.id === deviceTemplate)?.placeholders ?? []"
               :key="pb.id"> {{ pb.name }}:
          <input type="text" class="textInput" v-model="placeholders[pb.id]" required />
        </label>
      </template>
      <label class="inputlabel" @click.prevent="groups_vis = true">Groups:
        <textarea class="groups textInput" :value="selectedGroupsString" readonly />
      </label>
      <label class="inputlabel">Icon:
        <div class="iconWrapper unselectable" @click="icons_vis=true">
          <i v-if="currentIcon !== ''" :alt="currentIcon" class="material-icons-outlined currentIcon">
            {{ currentIcon }}
          </i>
        </div>
      </label>
      <div class="subBtn-container">
        <input type="submit" value="Submit" class="subBtn" />
      </div>
    </form>
    <div class="iconSelWrapper">
      <iconSelection height="400px" v-if="icons_vis" @newIcon="changeIcon" />
    </div>
    <div class="selectionWrapper" v-if="groups_vis">
      <Selection title="Groups" height="400px" :options="workableGroupArr" @change="change"
                 @close="groups_vis = false" />
    </div>
  </div>
</template>

<script>
import iconSelection from "./iconSelection.vue";
import { getTemplates, postDevice } from "@/api";
import Selection from "./Selection.vue";

export default {
  name: "AddGroup",
  components: { iconSelection, Selection },
  props: {},
  data: function() {
    return {
      icons_vis: false,
      groups_vis: false,
      currentIcon: "",
      deviceTemplate: {},
      deviceName: "",
      selectedGroupNames: [],
      selectedGroupIds: [],
      workableGroupArr: [],
      placeholders: {},
    };
  },
  computed: {
    templates() {
      return this.$store.getters.getTemplates.templates;
    },
    selectedGroupsString() {
      return this.selectedGroupNames.join(", ");
    },
    groups() {
      return this.$store.getters.getGroups;
    },
    defaultGroup() {
      return this.$store.getters.getCurrentGroup;
    },
  },
  methods: {
    // getPath() {
    //     return require("../../assets/icons/"+this.currentIcon+".svg");
    // },
    changeIcon(newIcon) {
      this.icons_vis = false;
      this.currentIcon = newIcon;
    },
    postDevice() {
      postDevice(this.deviceName, this.currentIcon, this.deviceTemplate, this.selectedGroupIds, this.placeholders);
      this.$emit("submitted");
    },
    change(selGroups) {
      if (!selGroups.type) {
        this.selectedGroupNames = [];
        this.selectedGroupIds = [];

        for (const group of selGroups) {
          this.selectedGroupNames.push(group.name);
          this.selectedGroupIds.push(group.id);
        }
      }
    },
    setInitSelect() {
      let tempArr = [];
      for (const group of this.groups) {
        let temp = { name: group.name, id: group.id, checked: this.selectedGroupIds.includes(group.id) };
        tempArr.push(temp);
      }
      this.workableGroupArr = tempArr;
    },
  },
  mounted() {
    getTemplates();
    this.selectedGroupNames = [this.defaultGroup.name];
    this.selectedGroupIds = [this.defaultGroup.id];
    this.setInitSelect();
  },
};
</script>

<style scoped lang="scss">
.addDeviceContainer {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  background-color: transparent;

  .title {
    color: white;
    margin-bottom: 10px;
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

      .groups {
        cursor: pointer;
        resize: none;

        &:focus {
          outline: none;
        }
      }

      .iconWrapper {
        background-color: white;
        height: 32px;
        width: 32px;
        border-radius: 3px;
        margin: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        padding: 3px;

        .currentIcon {
          width: 30px;
          color: #000000;
          font-weight: bold;
          filter: invert(16%) sepia(5%) saturate(711%) hue-rotate(201deg) brightness(93%) contrast(83%);
        }
      }

      .textInput {
        width: 170px;
        border-radius: 2px;
        padding: 7px;
        box-sizing: border-box;
        margin: 5px 5px 5px 40px;
        border: none;
        background-color: white;
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
    margin: 30px auto auto;
  }

  .selectionWrapper {
    position: absolute;
    margin: auto;
  }
}
</style>
