import axios from "axios";
import { API } from "../config/config";

const CART_KEY = 'RESTROPROSAAS__CART';

export async function getQRMenuInit(qrcode, tableId) {
    axios.defaults.withCredentials = true;
    try {
        const response = await axios.get(`${API}/qrmenu/${qrcode}?tableId=${tableId}`);
        return response;
    } catch (error) {
        throw error;
    }
}

export function getCart() {
    const cartString = localStorage.getItem(CART_KEY);
    const cart = cartString ? JSON.parse(cartString) : [];
    return cart;
}

export function setCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export async function createOrderFromQrMenu(deliveryType , cartItems, customerType, customer, tableId , qrcode) {
    try {
        const response = await axios.post(`${API}/qrmenu/${qrcode}/place-order` , {
           deliveryType, cartItems, customerType, customer, tableId
        });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function saveFeedback(qrcode, invoiceId, customerId, name, phone, email, birthdate, food_quality, service, ambiance, staff_behavior, recommend, remarks) {
    try {
        const response = await axios.post(`${API}/qrmenu/${qrcode}/feedback` , {
            invoiceId, customerId, name, phone, email, birthdate, food_quality, service, ambiance, staff_behavior, recommend, remarks
        });
        return response;
    } catch (error) {
        throw error;
    }
}