import ApiClient from "../helpers/ApiClient";
import axios from "axios";
import { API } from "../config/config";
import { clearUserDetailsInLocalStorage } from "../helpers/UserDetails";
import useSWR from "swr";

export async function signIn(username, password) {
  axios.defaults.withCredentials = true;
  try {
    const response = await axios.post(`${API}/superadmin/signin`, {
      username, password
    });

    return response;
  } catch (error) {
    throw error;
  }
}


export async function signOut() {
  axios.defaults.withCredentials = true;
  try {
    const response = await ApiClient.post(`${API}/superadmin/signout`);

    clearUserDetailsInLocalStorage();

    return response;
  } catch (error) {
    throw error;
  }
}

const fetcher = (url) => ApiClient.get(url).then((res) => res.data);

export function useSuperAdminDashboard() {
  const APIURL = `/superadmin/dashboard`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export function useSuperAdminTenantsData() {
  const APIURL = `/superadmin/tenantsData`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export async function getSuperAdminTenantsData() {
  try {
    const APIURL = `/superadmin/tenantsData`;
    const response = await ApiClient.get(APIURL);
    return response;
  } catch (error) {
    throw error;
  }
}
export async function getTenantsData({page, perPage, search, status , type , from , to}) {
  try {
    const response = await ApiClient.get(`${API}/superadmin/tenants?page=${page}&perPage=${perPage}&search=${search}&status=${status}&type=${type}&from=${from}&to=${to}`);
    return response;
  } catch (error) {
    throw error;
  }
}

export async function addTenant(name , email , password , isActive) {
  try {
    const response = await ApiClient.post(`${API}/superadmin/tenants/add`, {
      name , email , password , isActive
    });

    return response;
  } catch (error) {
    throw error;
  }
}

export async function updateTenant(name , email , isActive , id) {
  try {
    const response = await ApiClient.patch(`${API}/superadmin/tenants/update/${id}`, {
      name , email , isActive
    });
        return response;
    } catch (error) {
        throw error;
    }
}

export async function deleteTenant(id) {
  try {
    const response = await ApiClient.delete(`${API}/superadmin/tenants/delete/${id}`);

    return response;
  } catch (error) {
    throw error;
  }
}

export async function getTenantsDataByStatus(status) {
  try {
    const response = await ApiClient.get(`${API}/superadmin/tenantsData/${status}`);

    return response;
  } catch (error) {
    throw error;
  }
}

export function useSuperAdminReports({ type, from = null, to = null }) {
  const APIURL = `/superadmin/reports?type=${type}&from=${from}&to=${to}`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}

export function useSuperAdminTenantSubscriptionHistory(tenantId) {
  const APIURL = `/superadmin/tenants/${tenantId}/subscription-history`;
  const { data, error, isLoading } = useSWR(APIURL, fetcher);
  return {
    data,
    error,
    isLoading,
    APIURL,
  };
}