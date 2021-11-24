<template>
  <div>
    <div>
      <img :alt="$auth.user.name" :src="$auth.user.picture">
      <h2>{{ $auth.user.name }} <span v-if="$auth.isAdmin">(admin)</span></h2>
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
  name: "Profile.vue"
}
</script>

<style scoped>

</style>
