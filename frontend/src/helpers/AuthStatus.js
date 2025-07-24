export function isRestroUserAuthenticated() {
    const restroAuthenticated = document.cookie.includes("restroprosaas__authenticated=");
    return restroAuthenticated;
}