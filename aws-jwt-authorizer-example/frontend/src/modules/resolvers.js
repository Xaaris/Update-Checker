import {getInstance} from "@/auth";


export async function productsResolverGuard(to, from, next) {
    return afterLoading(async () => {
        const authService = getInstance();
        // If the user is authenticated, continue with the route
        if (authService.isAuthenticated) {
            const token = await authService.getTokenSilently()
            const response = await fetch('/api/products', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                to.meta.products = await response.json();
                return next();
            } else {
                alert(`Failed to retrieve products: ${response.statusCode}`);
                return next('/');
            }

        }

        // Otherwise, log in
        authService.loginWithRedirect({appState: {targetUrl: to.fullPath}});
    });
}

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