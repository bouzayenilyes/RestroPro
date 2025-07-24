import React, { useRef } from "react";
import Page from "../../components/Page";
import { IconEye, IconEyeOff, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";
import { iconStroke } from "../../config/config";
import { addCategory, deleteCategory, updateCategory, useCategories, changeCategoryVisibilty } from "../../controllers/settings.controller";
import toast from "react-hot-toast";
import { mutate } from "swr";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../contexts/ThemeContext";

export default function CategoriesPage() {
  const { t } = useTranslation();
  const categoryTitleRef = useRef();

  const categoryIdRef = useRef();
  const categoryTitleUpdateRef = useRef();

  const { APIURL, data: categories, error, isLoading } = useCategories();

  const { theme } = useTheme();

  if (isLoading) {
    return <Page className="px-8 py-6">{t("categories.please_wait")}</Page>;
  }

  if (error) {
    console.error(error);
    return <Page className="px-8 py-6">{t("categories.error_loading_data")}</Page>;
  }

  async function btnAdd() {
    const title = categoryTitleRef.current.value;

    if(!title) {
      toast.error(t("categories.please_provide_category_title"));
      return;
    }

    try {
      toast.loading(t("categories.please_wait"));
      const res = await addCategory(title);

      if(res.status == 200) {
        categoryTitleRef.current.value = "";
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  const btnShowUpdate = async (id, title) => {
    categoryIdRef.current.value = id;
    categoryTitleUpdateRef.current.value = title;
    document.getElementById('modal-update').showModal();
  };

  const btnUpdate = async () => {
    const id = categoryIdRef.current.value
    const title = categoryTitleUpdateRef.current.value

    if(!title) {
      toast.error(t("categories.please_provide_category_title"));
      return;
    }

    try {
      toast.loading(t("categories.please_wait"));
      const res = await updateCategory(id, title);

      if(res.status == 200) {
        categoryIdRef.current.value = null;
        categoryTitleUpdateRef.current.value = null;

        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnDelete = async (id) => {
    const isConfirm = window.confirm(t("categories.are_you_sure"));

    if(!isConfirm) {
      return;
    }

    try {
      toast.loading(t("categories.please_wait"));
      const res = await deleteCategory(id);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  const btnChangeCategoryVisibilty = async (id, isEnabled) => {
    try {
      toast.loading(t("categories.please_wait"));
      const res = await changeCategoryVisibilty(id, isEnabled);

      if(res.status == 200) {
        await mutate(APIURL);
        toast.dismiss();
        toast.success(res.data.message);
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("categories.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };

  return (
    <Page className="px-8 py-6">
      <div className="flex items-center gap-6">
        <h3 className="text-3xl font-light">{t("categories.title")}</h3>
        <button
          onClick={() => document.getElementById("modal-add").showModal()}
          className="text-sm rounded-lg border transition active:scale-95 hover:shadow-lg px-2 py-1 flex items-center gap-1 text-restro-text bg-restro-gray border-restro-border-green hover:bg-restro-button-hover"
        >
          <IconPlus size={22} stroke={iconStroke} /> {t("categories.new")}
        </button>
      </div>

      <div className="mt-8 w-full">
        <table className='w-full border overflow-x-auto border-restro-border-green'>
          <thead>
            <tr>
              <th className='px-3 py-2 font-medium md:w-20 text-start text-gray-500 bg-restro-card-bg'>
                #
              </th>
              <th className='px-3 py-2 font-medium md:w-96 text-start text-gray-500 bg-restro-card-bg'>
                {t("categories.category_title")}
              </th>

              <th className='px-3 py-2 font-medium md:w-28 text-start text-gray-500 bg-restro-card-bg'>
                {t("categories.actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => {
              const { id, title, is_enabled } = category;

              return (
                <tr key={index} className={`${!is_enabled ? 'opacity-50' : ''}`}>
                  <td className="px-3 py-2 text-start">{index+1}</td>
                  <td className="px-3 py-2 text-start">{title}</td>
                  <td className="px-3 py-2 text-start flex gap-2 items-center">
                  <button
                    onClick={() => {
                      btnChangeCategoryVisibilty(id, !is_enabled);
                    }}
                    className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 hover:bg-restro-button-hover text-restro-text'
                  >
                    {is_enabled ? <IconEye stroke={iconStroke} /> : <IconEyeOff stroke={iconStroke} />}
                  </button>
                    <button
                      onClick={() => {
                        btnShowUpdate(id, title);
                      }}
                     className='w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95 text-restro-text hover:bg-restro-button-hover'>
                      <IconPencil stroke={iconStroke} />
                    </button>
                    <button
                      onClick={()=>{
                        btnDelete(id);
                      }}
                     className='w-8 h-8 rounded-full flex items-center justify-center text-red-500 transition active:scale-95 hover:bg-restro-button-hover'
                    >
                      <IconTrash stroke={iconStroke} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <dialog id="modal-add" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("categories.add_new_category")}</h3>

          <div className="my-4">
            <label htmlFor="title" className='mb-1 block text-gray-500 text-sm'>{t("categories.category_title")}</label>
            <input ref={categoryTitleRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t("categories.enter_category_title")} />
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className='btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("categories.close")}</button>
              <button onClick={()=>{btnAdd();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t("categories.save")}</button>
            </form>
          </div>
        </div>
      </dialog>

      <dialog id="modal-update" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t("categories.update_category")}</h3>

          <div className="my-4">
            <input type="hidden" ref={categoryIdRef} />
            <label htmlFor="title" className="mb-1 block text-gray-500 text-sm">{t("categories.category_title")}</label>
            <input ref={categoryTitleUpdateRef} type="text" name="title" className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green bg-restro-gray' placeholder={t("categories.enter_category_title")} />
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className ='btn transition active:scale-95 hover:shadow-lg px-4 py-3 items-center justify-center align-center rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text'>{t("categories.close")}</button>
              <button onClick={()=>{btnUpdate();}} className='rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 border border-restro-border-green bg-restro-green hover:bg-restro-green-button-hover'>{t("categories.save")}</button>
            </form>
          </div>
        </div>
      </dialog>

    </Page>
  );
}
