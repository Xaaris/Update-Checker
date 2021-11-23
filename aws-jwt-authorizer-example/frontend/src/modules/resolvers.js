import {getInstance} from "@/auth";

export async function helloWorldResolverGuard(to, from, next) {
    const authService = getInstance();

    const fn = async () => {
        // If the user is authenticated, continue with the route
        if (authService.isAuthenticated) {
            const token = await authService.getTokenSilently()
            const response = await fetch('/api/profile', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.ok) {
                to.meta.message = (await response.json()).message;
                return next();
            } else {
                alert(`Failed to retrieve message: ${response.statusCode}`);
                return next('/');
            }

        }

        // Otherwise, log in
        authService.loginWithRedirect({ appState: { targetUrl: to.fullPath } });
    };

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