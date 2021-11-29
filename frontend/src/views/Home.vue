<template>
  <div class="home">
    <!-- Check that the SDK client is not currently loading before accessing is methods -->
    <div v-if="$auth.loading">
      Loading ...
    </div>
    <div v-else>
      <h1>Product Checker</h1>
      <p>A tool that keeps you informed about your favorite products</p>
    </div>
  </div>
</template>


<script>

export default {
  name: "home",
  components: {
  },
  methods: {
    // Log the user in
    login() {
      this.$auth.loginWithRedirect();
    },
    // Log the user out
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin
      });
    }
  }
};
</script>
