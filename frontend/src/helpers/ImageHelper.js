import { API_IMAGES_BASE_URL } from "../config/config";

export function getImageURL(path) {
    return API_IMAGES_BASE_URL + path;
}