import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'
import 'bootstrap/scss/bootstrap.scss';


// Import the Auth0 configuration
import {clientId, domain, audience, scope} from "../auth_config.json";

// Import the plugin here
import {AuthPlugin} from "./auth";

Vue.use(AuthPlugin, {
    domain,
    clientId,
    audience,
    scope,
    onRedirectCallback: appState => {
        router.push(
            appState && appState.targetUrl
                ? appState.targetUrl
                : window.location.pathname
        );
    }
});

Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
