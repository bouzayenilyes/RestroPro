import ApiClient from "../helpers/ApiClient";
import useSWR from "swr";

const fetcher = (url) => ApiClient.get(url).then((res) => res.data);

export function useReservationsInit() {
  const APIURL = `/reservations/init`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export function useReservations({ type, from = null, to = null }) {
  const APIURL = `/reservations?type=${type}&from=${from}&to=${to}`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export async function searchReservations(query) {
  try {
    const response = await ApiClient.get(`/reservations/search?q=${query}`);
    return response;
  } catch (error) {
    throw error;
  }
}


export async function addReservation(customerId, date, tableId, status, notes, peopleCount) {
  try {
    const response = await ApiClient.post("/reservations/add", {
      customerId, date, tableId, status, notes, peopleCount
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteReservation(id) {
  try {
    const response = await ApiClient.delete(`/reservations/delete/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateReservation(id, date, tableId, status, notes, peopleCount) {
  try {
    const response = await ApiClient.post(`/reservations/update/${id}`, {
      date, tableId, status, notes, peopleCount
    });
    return response;
  } catch (error) {
    throw error;
  }
}