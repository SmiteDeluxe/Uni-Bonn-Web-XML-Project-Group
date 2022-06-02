<!--Edited by: *** ***-->
<template>
  <div v-if="!currentRouteName" class="wrapper">
    <div class="select-wrapper">
      <select name="users" class="users" v-model="selectedUser">
        <option v-for="user in users" :key="user.id" :value="user.name">{{ user.name }}</option>
      </select>
    </div>
    <img src="/assets/user.svg" alt="User icon" class="user_icon" />
  </div>
</template>

<script>
export default {
  name: "UsersSelect",
  components: {},
  data: function() {
    return {};
  },
  computed: {
    users() {
      return this.$store.getters.getUsers;
    },
    currentRouteName() {
      return (this.$route.name === "Stats" || this.$route.name === "Log");
    },
    selectedUser: {
      get: function() {
        return this.$store.getters.getCurrentUser.name;
      },
      set: function(newUser) {
        if (newUser.id !== this.$store.getters.getCurrentUser.id) this.$store.commit("setCurrentUser", this.users.filter(el => el.name === newUser)[0]);
      },
    },
  },
  methods: {},
  mounted() {
  },
};
</script>

<style scoped lang="scss">

.wrapper {
  z-index: 1;
  width: 220px;
  height: 80px;
  background-color: #CA5310;
  border-radius: 10px;
  display: flex;
  align-items: center;

  .select-wrapper {
    margin-left: 20px;
    height: 30px;
    width: 100px;
    background-color: white;
    padding-right: 10px;

    .users {
      width: 100%;
      height: 100%;
      border: none;
      -moz-padding-start: calc(10px - 3px);
      padding-left: 10px;
      outline: none;
      background-color: white;
      color: #36363a;
      font-weight: bold;

      &::-ms-expand {
        display: none;
      }
    }
  }

  .user_icon {
    position: absolute;
    right: 20px;
    bottom: 20px;
    height: 40px;
    cursor: pointer;
    filter: invert(100%) sepia(3%) saturate(13%) hue-rotate(81deg) brightness(106%) contrast(106%);
  }
}

</style>
