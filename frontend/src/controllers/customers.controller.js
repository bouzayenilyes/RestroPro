import ApiClient from "../helpers/ApiClient";
import useSWR from "swr";

const fetcher = (url) => ApiClient.get(url).then((res) => res.data);

export function useCustomers({ page = 1, perPage = 10, filter = "" }) {
  const APIURL = `/customers?sort=created_at&page=${page}&filter=${filter}&perPage=${perPage}`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export async function searchCustomer(search) {
  try {
    const response = await ApiClient.get(`/customers/search-by-phone-name/search?q=${search}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function getAllCustomers() {
  try {
    const response = await ApiClient.get(`/customers/download/all`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function uploadBulkCustomers(customers) {
  try {
    const response = await ApiClient.post(`/customers/upload/bulk`, {customers});
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addCustomer(phone, name, email, birthDate, gender) {
  try {
    const response = await ApiClient.post("/customers/add", {
      phone,
      name,
      email,
      birthDate,
      gender,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateCustomer(phone, name, email, birthDate, gender) {
  try {
    const response = await ApiClient.post(`/customers/${phone}/update`, {
      name,
      email,
      birthDate,
      gender,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteCustomer(id) {
  try {
    const response = await ApiClient.delete(`/customers/${id}/delete`)
    return response;
  } catch (error) {
    throw error;
  }
};
