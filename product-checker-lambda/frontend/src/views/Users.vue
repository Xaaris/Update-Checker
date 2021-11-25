<template>
  <table class="table">
    <thead>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>E-Mail</th>
    </tr>
    </thead>
    <tbody>
    <tr v-for="user in users" :key="user.id">
      <td>{{user.id}}</td>
      <td>{{user.name}}</td>
      <td>{{user.email}}</td>
    </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "Users",
  data() {
    return {
      users: []
    }
  },
  created() {
    this.users = this.$route.meta.users;
  }
}
</script>

<style scoped>

</style>