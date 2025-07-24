import React, { useRef, useState } from "react";
import Page from "../components/Page";
import {
  IconInfoCircle,
  IconMail,
  IconPhone,
  IconPlus,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { SCOPES } from "../config/scopes";
import { toast } from "react-hot-toast";
import { mutate } from "swr";
import { addNewUser, deleteUser, resetUserPassword, updateUser, useUsers } from "../controllers/users.controller";
import { validateEmail } from "../utils/emailValidator";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

export default function UsersPage() {
  const { t } = useTranslation();
  const [state, setState] = useState({
    selectedScopes: [],
  });

  const nameRef = useRef();
  const usernameRef = useRef();
  const passwordRef = useRef();
  const phoneRef = useRef();
  const designationRef = useRef();

  const changePasswordModalUsernameRef = useRef();
  const changePasswordModalNewPasswordRef = useRef();

  const nameUpdateRef = useRef();
  const usernameUpdateRef = useRef();
  const phoneUpdateRef = useRef();
  const emailUpdateRef = useRef();
  const designationUpdateRef = useRef();

  const { APIURL, data: users, error, isLoading } = useUsers();
  const {theme} = useTheme();

  if (isLoading) {
    return <Page>{t("users.loading")}</Page>;
  }

  if (error) {
    console.error(error);
    return <Page>{t("users.error_loading")}</Page>;
  }

  const { selectedScopes } = state;

  const btnAdd = async () => {
    const name = nameRef.current.value;
    const username = usernameRef.current.value;
    const password = passwordRef.current.value;
    const phone = phoneRef.current.value || null;
    const designation = designationRef.current.value || null;

    const userScopes = selectedScopes;

    if (!name) {
      toast.error(t("users.name_error"));
      return;
    }
    if (!username) {
      toast.error(t("users.username_error"));
      return;
    }
    if (!password) {
      toast.error(t("users.password_error"));
      return;
    }
    if(!validateEmail(username)) {
      toast.error(t("users.valid_email_error"));
      return;
    }

    try {
      toast.loading(t("users.loading_message"));
      const res = await addNewUser(
        username,
        password,
        name,
        designation,
        phone,
        null,
        userScopes
      );

      if (res.status == 200) {
        nameRef.current.value = null;
        usernameRef.current.value = null;
        passwordRef.current.value = null;
        phoneRef.current.value = null;
        designationRef.current.value = null;

        await mutate(APIURL);

        setState({
          ...state,
          selectedScopes: [],
        });

        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("users.error_message");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDelete = async (username) => {
    const isConfirm = window.confirm(t("users.delete_confirm"));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t("users.loading_message"));
      const res = await deleteUser(username);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("users.error_message");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnShowChangePassword = (username) => {
    changePasswordModalUsernameRef.current.value = username;
    document.getElementById("modal-reset-password").showModal()
  };

  const btnChangePassword = async () => {
    const username = changePasswordModalUsernameRef.current.value;
    const password = changePasswordModalNewPasswordRef.current.value;

    if(!(username)) {
      toast.error(t("users.invalid_request"));
      return;
    }
    if(!(password)) {
      toast.error(t("users.new_password_error"));
      return;
    }

    try {
      toast.loading(t("users.loading_message"));
      const res = await resetUserPassword(
        username,
        password,
      );

      if (res.status == 200) {
        
        changePasswordModalUsernameRef.current.value = null;
        changePasswordModalNewPasswordRef.current.value = null;
        
        await mutate(APIURL);

        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("users.error_message");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnShowUpdate = (username, name, phone, email, designation, scope) => {
    usernameUpdateRef.current.value = username;
    nameUpdateRef.current.value = name;
    phoneUpdateRef.current.value = phone;
    designationUpdateRef.current.value = designation;

    setState({
      ...state,
      selectedScopes: scope ? new String(scope).split(",") : []
    })

    document.getElementById("modal-update").showModal()
  };

  const btnUpdate = async () => {
    const username = usernameUpdateRef.current.value;
    const name = nameUpdateRef.current.value;
    const phone = phoneUpdateRef.current.value;
    const designation = designationUpdateRef.current.value;

    const userScopes = selectedScopes;

    if (!name) {
      toast.error(t("users.name_error"));
      return;
    }
    if (!username) {
      toast.error(t("users.username_error"));
      return;
    }

    try {
      toast.loading(t("users.loading_message"));
      const res = await updateUser(
        username,
        name, designation, phone, null, userScopes
      );

      if (res.status == 200) {
        usernameUpdateRef.current.value = null;
        nameUpdateRef.current.value = null;
        phoneUpdateRef.current.value = null;
        designationUpdateRef.current.value = null;

        await mutate(APIURL);

        setState({
          ...state,
          selectedScopes: [],
        });

        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("users.error_message");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page>
      <div className="flex items-center gap-6">
        <h3 className="text-3xl font-light">{t("users.title")}</h3>
        <button
          onClick={() => document.getElementById("modal-add").showModal()}
          className='border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 w-fit text-restro-text rounded-lg bg-restro-card-bg border-restro-border-green hover:bg-restro-button-hover'
        >
          <IconPlus size={22} stroke={iconStroke} /> {t("users.new")}
        </button>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
        {users.map((user, index) => {
          const {
            username,
            name,
            role,
            photo,
            designation,
            phone,
            email,
            scope,
          } = user;

          const userScopes = scope ? new String(scope).split(",") : [];

          return (
            <div
              key={index}
              className='px-4 py-5 flex-col rounded-2xl flex flex-wrap items-center gap-2 text-sm border border-restro-border-green'
            >
              <div className="flex-1">
                <div className="flex items-center flex-col text-center gap-2">
                  <div className='flex w-24 h-24 rounded-full items-center justify-center text-gray-500 dark:text-white bg-restro-bg-gray border-restro-border-green'>
                    <IconUser size={32} stroke={iconStroke} />
                  </div>
                  <div>
                    <p>{name}</p>
                    <p className="text-xs text-gray-500">
                      {role.toUpperCase()} 
                    </p>
                    <p className="flex gap-1 text-xs text-gray-500"><IconMail stroke={iconStroke} size={18} /> {username}</p>
                    {designation && <p className="text-xs text-white bg-restro-green rounded-full w-fit px-2 mx-auto mt-1">{designation}</p>}
                  </div>
                </div>

                {phone && (
                  <p className="mt-2 text-sm flex items-center gap-1 text-gray-500">
                    <IconPhone stroke={iconStroke} size={18} /> {phone}
                  </p>
                )}
                {email && (
                  <p className="mt-2 text-sm flex flex-wrap items-center gap-1 text-gray-500 truncate ">
                    <IconMail stroke={iconStroke} size={18} /> {email}
                  </p>
                )}

                {userScopes.length > 0 && (
                  <div>
                    <p className="text-xs mt-2 mb-2">{t("users.scopes")}:</p>
                    <div className="flex flex-wrap gap-2 w-full">
                      {userScopes.map((s, i) => (
                        <div
                          key={i}
                          className='text-xs dark:rounded-full gap-1 flex items-center px-2 py-1 border rounded-full bg-restro-gray border-restro-border-green text-restro-text outline-restro-border-green-light'
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {role != "admin" && (
                <div className="flex flex-wrap gap-2 mt-4 ">
                  <button
                    onClick={() => {
                      btnShowUpdate(username, name, phone, null, designation, scope);
                    }}
                    // className="btn btn-xs text-gray-500 flex-1"
                    className='btn btn-xs flex-1 transition active:scale-95 hover:shadow-lg px-4 py-1 h-9 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'
                  >
                    {t("users.edit_user")}
                  </button>
                  <button
                    onClick={() => {
                      btnShowChangePassword(username);
                    }}
                    className='btn btn-xs flex-1 transition active:scale-95 hover:shadow-lg px-4 py-1 h-9 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'
                  >
                    {t("users.reset_password")}
                  </button>
                  <button
                    onClick={() => {
                      btnDelete(username);
                    }}
                    className='btn btn-xs text-restro-red flex-1 transition active:scale-95 hover:shadow-lg px-4 py-1 h-9 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover'
                  >
                    {t("users.delete_user")}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* modal add */}
      <dialog id="modal-add" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("users.add_new_user")}</h3>

          <div className="mt-4">
            <label htmlFor="name" className="mb-1 block text-restro-text text-sm">
              {t("users.name_label")} <span className="text-xs text-gray-400">- ({t("users.required")})</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              name="name"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
              placeholder={t("users.name_placeholder")}
            />
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="username"
                className="mb-1 block text-restro-text text-sm"
              >
                {t("users.email_label")}{" "}
                <span className="text-xs text-gray-400">- ({t("users.required")})</span>
              </label>
              <input
                ref={usernameRef}
                type="email"
                name="username"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.email_placeholder")}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="password"
                className="mb-1 block text-restro-text text-sm"
              >
                {t("users.password_label")}{" "}
                <span className="text-xs text-gray-400">- ({t("users.required")})</span>
              </label>
              <input
                ref={passwordRef}
                type="password"
                name="password"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.password_placeholder")}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="phone"
                className="mb-1 block text-restro-text text-sm"
              >
                {t("users.phone_label")}
              </label>
              <input
                ref={phoneRef}
                type="tel"
                name="phone"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.phone_placeholder")}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="designation"
                className="mb-1 block text-restro-text text-sm"
              >
                {t("users.designation_label")}
              </label>
              <input
                ref={designationRef}
                type="text"
                name="designation"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.designation_placeholder")}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full mt-4">
            <div className="flex-1">
              <label
                htmlFor="scope"
                className="mb-1 text-restro-text text-sm flex items-center gap-1"
              >
                {t("users.scope_label")}
                <div
                  className="tooltip tooltip-right"
                  data-tip={t("users.scope_tooltip")}
                >
                  <IconInfoCircle
                    className="text-gray-400"
                    stroke={iconStroke}
                    size={14}
                  />
                </div>
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setState({
                      ...state,
                      selectedScopes: [
                        ...new Set([...selectedScopes, e.target.value]),
                      ],
                    });
                  }
                }}
                name="scope"
                className='text-sm w-full rounded-lg px-2 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.scope_placeholder")}
              >
                <option value="">{t("users.scope_select")}</option>
                {Object.values(SCOPES).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full mt-4">
            {selectedScopes.map((s, i) => (
              <div
                key={i}
                className='text-sm rounded-full gap-1 flex items-center p-2 bg-restro-gray '
              >
                {s}
                <button
                  onClick={() => {
                    setState({
                      ...state,
                      selectedScopes: selectedScopes.filter(
                        (scope) => scope != s
                      ),
                    });
                  }}
                  className="text-restro-red"
                >
                  <IconX stroke={iconStroke} size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="modal-action mt-4">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                {t("users.close")}
              </button>
              <button
                onClick={() => {
                  btnAdd();
                }}
                className = 'btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t("users.save")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* modal add */}

      {/* modal update */}
      <dialog id="modal-update" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("users.update_user")}</h3>

          <div className="mt-4">
              <label
                htmlFor="username"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("users.username_label")}{" "}
                <span className="text-xs text-gray-400">- ({t("users.required")})</span>
              </label>
              <input
                ref={usernameUpdateRef}
                disabled
                type="email"
                name="username"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green cursor-not-allowed'
                placeholder={t("users.username_placeholder")}
              />
            </div>

          <div className="flex gap-4 w-full my-4">
          <div className="flex-1">
            <label htmlFor="name" className="mb-1 block text-gray-500 text-sm">
              {t("users.name_label")} <span className="text-xs text-gray-400">- ({t("users.required")})</span>
            </label>
            <input
              ref={nameUpdateRef}
              type="text"
              name="name"
              className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
              placeholder={t("users.name_placeholder")}
            />
          </div>
            
          </div>

          <div className="flex gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="phone"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("users.phone_label")}
              </label>
              <input
                ref={phoneUpdateRef}
                type="tel"
                name="phone"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.phone_placeholder")}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="designation"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("users.designation_label")}
              </label>
              <input
                ref={designationUpdateRef}
                type="text"
                name="designation"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.designation_placeholder")}
              />
            </div>
          </div>

          <div className="flex gap-4 w-full mt-4">
            <div className="flex-1">
              <label
                htmlFor="scope"
                className="mb-1 text-gray-500 text-sm flex items-center gap-1"
              >
                {t("users.scope_label")}
                <div
                  className="tooltip tooltip-right"
                  data-tip={t("users.scope_tooltip")}
                >
                  <IconInfoCircle
                    className="text-gray-400"
                    stroke={iconStroke}
                    size={14}
                  />
                </div>
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setState({
                      ...state,
                      selectedScopes: [
                        ...new Set([...selectedScopes, e.target.value]),
                      ],
                    });
                  }
                }}
                name="scope"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green bg-restro-gray dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.scope_placeholder")}
              >
                <option value="">{t("users.scope_select")}</option>
                {Object.values(SCOPES).map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 w-full mt-4">
            {selectedScopes.map((s, i) => (
              <div
                key={i}
                className={`text-sm border dark:rounded-full gap-1 flex items-center p-2 outline-restro-border-green-light ${theme === 'black' ? 'bg-restro-bg-hover-dark-mode border-gray-700 rounded-full focus:outline-restro-placeholder-outline-dark-mode' : 'bg-gray-100 border rounded-full text-gray-400'}`}
              >
                {s}
                <button
                  onClick={() => {
                    setState({
                      ...state,
                      selectedScopes: selectedScopes.filter(
                        (scope) => scope != s
                      ),
                    });
                  }}
                  className="text-red-400"
                >
                  <IconX stroke={iconStroke} size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="modal-action mt-4">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                {t("users.close")}
              </button>
              <button
                onClick={() => {
                  btnUpdate();
                }}
                className = 'btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>
                {t("users.save")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* modal update */}

      {/* modal reset password */}
      <dialog id="modal-reset-password" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("users.reset_password")}</h3>

          <div className="flex flex-col gap-4 w-full my-4">
            <div className="flex-1">
              <label
                htmlFor="username"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("users.username_label")}
              </label>
              <input
                ref={changePasswordModalUsernameRef}
                disabled
                type="text"
                name="username"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.username_placeholder")}
              />
            </div>
            <div className="flex-1">
              <label
                htmlFor="password"
                className="mb-1 block text-gray-500 text-sm"
              >
                {t("users.password_label")}{" "}
                <span className="text-xs text-gray-400">- ({t("users.required")})</span>
              </label>
              <input
                ref={changePasswordModalNewPasswordRef}
                type="password"
                name="password"
                className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                placeholder={t("users.password_placeholder")}
              />
            </div>
          </div>


          <div className="modal-action mt-4">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button  className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 flex-1 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>
                {t("users.close")}
              </button>
              <button
                onClick={() => {
                  btnChangePassword();
                }}
                className = 'btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t("users.save")}
              </button>
            </form>
          </div>
        </div>
      </dialog>
      {/* modal change password */}
    </Page>
  );
}
