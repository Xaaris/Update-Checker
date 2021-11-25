<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container">
        <a class="navbar-brand" href="#">Product Checker</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <template v-if="$auth.isAuthenticated">
              <li class="nav-item">
                <router-link class="nav-link" to="/profile">Profile</router-link>
              </li>
              <li class="nav-item">
                <router-link class="nav-link" to="/products">Products</router-link>
              </li>
              <li v-if="$auth.isAdmin" class="nav-item">
                <router-link class="nav-link" to="/users">Users</router-link>
              </li>
            </template>


          </ul>
          <ul class="navbar-nav mb-2 mb-lg-0">
            <li class="ms-auto nav-item">
              <template v-if="!$auth.isAuthenticated">
                <button class="btn btn-outline-secondary" @click="login">Log in</button>
              </template>
              <template v-else>
                <span class="nav-link">{{username}} <span class="me-2" v-if="$auth.isAdmin">(admin)</span>
                  <button class="btn btn-outline-secondary" @click="logout">Log out</button>
                </span>
              </template>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <div class="container">
      <router-view/>
    </div>
  </div>
</template>

<script>

export default {
  name: "App",
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
  },
  computed: {
    username() {
      return this.$auth.user.name;
    }
  }
};
</script>

<style lang="scss">

</style>
