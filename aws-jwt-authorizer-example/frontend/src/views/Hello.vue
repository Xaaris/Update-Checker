<template>
  <div>
    <h1>Message: {{ message }}</h1>
  </div>
</template>

<script>
export default {
  name: "Profile.vue",
  data() {
    return {
      message: ''
    }
  },
  created() {
    this.message = this.$route.meta.message;
  }
}
</script>

<style scoped>

</style>