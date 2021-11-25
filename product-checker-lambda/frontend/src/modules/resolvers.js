import {getInstance} from "@/auth";

async function getWithToken(url) {
    const authService = getInstance();
    const token = await authService.getTokenSilently()
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    if (response.ok) {
        return response.json();
    } else {
        throw new Error(`Failed to retrieve data: ${response.status}`)
    }
}

export async function productsResolverGuard(to, from, next) {
    return afterLoading(async () => {
        const authService = getInstance();
        // If the user is authenticated, continue with the route
        if (authService.isAuthenticated) {
            try {
                to.meta.products = await getWithToken('/api/products');
                return next();
            } catch (e) {
                alert(e.message);
                return next('/');
            }
        }

        // Otherwise, log in
        authService.loginWithRedirect({appState: {targetUrl: to.fullPath}});
    });
}

export const usersResolverGuard = (to, from, next) => {
    return afterLoading(async () => {
        const authService = getInstance();

        // If the user is authenticated, continue with the route
        if (!authService.isAuthenticated) {
            authService.loginWithRedirect({appState: {targetUrl: to.fullPath}});
        // } else if (!authService.isAdmin) {
        //     alert(`You have to be admin to view this page`);
        //     return next('/');
        } else {
            try {
                to.meta.users = await getWithToken('/api/users');
                return next();
            } catch (e) {
                alert(e.message);
                return next('/');
            }
        }
    })
};

export const authGuard = (to, from, next) => {
    return afterLoading(() => {
        const authService = getInstance();

        // If the user is authenticated, continue with the route
        if (authService.isAuthenticated) {
            return next();
        }

        // Otherwise, log in
        authService.loginWithRedirect({appState: {targetUrl: to.fullPath}});
    })
};

function afterLoading(fn) {
    const authService = getInstance();
    // If loading has already finished, check our auth state using `fn()`
    if (!authService.loading) {
        return fn();
    }

    // Watch for the loading property to change before we check isAuthenticated
    authService.$watch("loading", loading => {
        if (loading === false) {
            return fn();
        }
    });
}