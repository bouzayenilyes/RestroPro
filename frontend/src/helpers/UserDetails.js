const KEY = 'restroprosaas_user'
export function saveUserDetailsInLocalStorage(user) {
    localStorage.setItem(KEY, JSON.stringify(user));
}

export function getUserDetailsInLocalStorage() {
    const userStr = localStorage.getItem(KEY);
    return JSON.parse(userStr);
}

export function clearUserDetailsInLocalStorage() {
    localStorage.removeItem(KEY);
}