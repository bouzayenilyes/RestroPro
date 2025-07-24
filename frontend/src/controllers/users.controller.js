import ApiClient from "../helpers/ApiClient";
import useSWR from "swr";

const fetcher = (url) => ApiClient.get(url).then((res) => res.data);


export function useUsers() {
    const APIURL = `/users`;
    const { data, error, isLoading } = useSWR(APIURL, fetcher);
    return {
      data,
      error,
      isLoading,
      APIURL,
    };
  }
  

export async function addNewUser(
  username,
  password,
  name,
  designation,
  phone,
  email,
  userScopes
) {
  try {
    const response = await ApiClient.post("/users/add", {
      username,
      password,
      name,
      designation,
      phone,
      email,
      userScopes,
    });
    return response;
  } catch (error) {
    throw error;
  }
}

export async function deleteUser(username) {
  try {
    const response = await ApiClient.delete(`/users/delete/${username}`)
    return response;
  } catch (error) {
    throw error;
  }
};

export async function resetUserPassword(username, password) {
  try {
    const response = await ApiClient.post(`/users/update-password/${username}`, {
      password
    })
    return response;
  } catch (error) {
    throw error;
  }
};

export async function updateUser(
  username,
  name,
  designation,
  phone,
  email,
  userScopes
) {
  try {
    const response = await ApiClient.post(`/users/update/${username}`, {
      name,
      designation,
      phone,
      email,
      userScopes,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
