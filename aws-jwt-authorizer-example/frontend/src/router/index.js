import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Profile from "@/views/Profile";
import Products from "@/views/Products";
import {authGuard, productsResolverGuard} from "@/modules/resolvers";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: "/profile",
    name: "profile",
    component: Profile,
    beforeEnter: authGuard
  },
  {
    path: "/products",
    name: "products",
    component: Products,
    beforeEnter: productsResolverGuard
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  linkExactActiveClass: 'active',
  routes
})

export default router
