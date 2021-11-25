import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Profile from "@/views/Profile";
import Products from "@/views/Products";
import {authGuard, productsResolverGuard, usersResolverGuard} from "@/modules/resolvers";
import Users from "@/views/Users";

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
  },
  {
    path: "/users",
    name: "users",
    component: Users,
    beforeEnter: usersResolverGuard
  },
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  linkExactActiveClass: 'active',
  routes
})

export default router
