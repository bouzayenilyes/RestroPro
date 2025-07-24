import { FRONTEND_DOMAIN } from "../config/config";

export const getQRMenuLink = (code) => {
    return `${FRONTEND_DOMAIN}/m/${code}`;
}

export const getTableQRMenuLink = (code, tableId) => {
    return `${FRONTEND_DOMAIN}/m/${code}?table=${tableId}`;
}
