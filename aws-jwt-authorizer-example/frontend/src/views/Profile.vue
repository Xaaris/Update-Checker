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
    <div class="mt-3">
        <button class="btn btn-primary" @click="register">Register</button>
        <p v-if="registration">
          {{registration}}
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
    async register() {
      const token = await this.$auth.getTokenSilently()
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
          this.registration = await response.json();
      } else {
          alert(`Failed to retrieve message: ${response.statusCode}`);
          this.registration = undefined;
      }
    },
  }
}
</script>

<style scoped>

</style>
