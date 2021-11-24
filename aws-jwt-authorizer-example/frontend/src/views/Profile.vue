<template>
  <div>
    <div>
      <img :alt="$auth.user.name" :src="$auth.user.picture">
      <h2>{{ $auth.user.name }}</h2>
      <p><strong>ID:</strong> {{$auth.user.sub}}</p>
      <p>
        <strong>E-Mail: </strong> {{ $auth.user.email }}
        (<span v-if="$auth.user.email_verified">verified</span>
        <span v-else>not verified</span>)
      </p>
    </div>
  </div>
</template>

<script>
export default {
  name: "Profile.vue",
  data() {
    return {
      registration: undefined
    }
  },
  methods: {
  }
}
</script>

<style scoped>

</style>
