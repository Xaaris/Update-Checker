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
        <td><button class="btn btn-outline-secondary" @click="subscribe(product.id)">Subscribe</button></td>
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
  },
  methods: {
    async subscribe(productId) {
      const token = await this.$auth.getTokenSilently()
      const response = await fetch('/api/subscribe?' + new URLSearchParams({productId: productId}), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert(`Subscribed to ${productId}`)
      } else {
        alert(`Failed to subscribe: ${response.statusCode}`);
      }
    }
  }
}
</script>

<style scoped>

</style>