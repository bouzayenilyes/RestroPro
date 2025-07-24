import ApiClient from "../helpers/ApiClient";
import useSWR from "swr";

const fetcher = (url) => ApiClient.get(url).then((res) => res.data);

export function useKitchenOrders() {
  const APIURL = `/kitchen`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export async function getKitchenOrders() {
  try {
    const res = await ApiClient.get("/kitchen");
    return res;
  } catch (error) {
    throw error;
  }
}

export async function updateKitchenOrderItemStatus(
  orderItemId,
  status
) {
  try {
    const response = await ApiClient.post(`/kitchen/${orderItemId}`, {
      status
    });
    return response;
  } catch (error) {
    throw error;
  }
}
