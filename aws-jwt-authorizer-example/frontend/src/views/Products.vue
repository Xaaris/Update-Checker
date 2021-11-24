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
        <td>
          <button v-if="!product.subscribed" class="btn btn-outline-secondary" @click="subscribe(product.id)">Subscribe</button>
          <button v-else class="btn btn-outline-secondary" @click="unsubscribe(product.id)">Unsubscribe</button>
        </td>
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
    this.getSubscriptions()
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
      await this.getSubscriptions()
    },

    async unsubscribe(productId) {
      const token = await this.$auth.getTokenSilently()
      const response = await fetch('/api/unsubscribe?' + new URLSearchParams({productId: productId}), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        alert(`Unsubscribed from ${productId}`);
      } else {
        alert(`Failed to unsubscribe: ${response.statusCode}`);
      }
      await this.getSubscriptions()
    },

    async getSubscriptions() {
      const token = await this.$auth.getTokenSilently()
      const response = await fetch('/api/subscriptions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.ok) {
        const body = await response.json();
        let subscriptionProductIds = new Set(body.map(sub => sub.productId));
        this.products = this.products.map(product => {
          if (subscriptionProductIds.has(product.id)) {
            product.subscribed = true
          } else {
            product.subscribed = false
          }
          return product;
        })
      } else {
        alert(`Failed to retrieve your subscriptions: ${response.statusCode}`);
      }
    }
  }
}
</script>

<style scoped>

</style>