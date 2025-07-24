import ApiClient from "../helpers/ApiClient";
import useSWR from "swr";

const fetcher = (url) => ApiClient.get(url).then((res) => res.data);

export function useInvoices({ type, from = null, to = null }) {
  const APIURL = `/invoices?type=${type}&from=${from}&to=${to}`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export async function getInvoicesInit() {
  try {
    const res = await ApiClient.get("/invoices/init");
    return res;
  } catch (error) {
    throw error;
  }
}

export async function getInvoiceOrders(invoiceId, orderIds) {
  try {
    const res = await ApiClient.post("/invoices/orders", {
      invoiceId,
      orderIds
    });
    return res;
  } catch (error) {
    throw error;
  }
}

export async function searchInvoices(query) {
  try {
    const response = await ApiClient.get(`/invoices/search?q=${query}`);
    return response;
  } catch (error) {
    throw error;
  }
}
