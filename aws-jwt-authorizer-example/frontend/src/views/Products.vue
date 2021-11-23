<template>
  <table class="table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Provider</th>
        <th>Current Version</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="product in products" :key="product.id">
        <td>{{product.id}}</td>
        <td>{{product.name}}</td>
        <td>{{product.provider}}</td>
        <td>{{product.currentVersion}}</td>
        <td><button class="btn btn-outline-secondary">Subscribe</button></td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: "Products",
  data() {
    return {
      products: []
    }
  },
  created() {
    this.products = this.$route.meta.products;
  }
}
</script>

<style scoped>

</style>