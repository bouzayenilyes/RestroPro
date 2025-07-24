import React, { useEffect, useRef, useState } from 'react';
import Page from '../components/Page';
import { IconDotsVertical, IconDownload, IconEye, IconFilter, IconFilterFilled, IconInfoSquareRoundedFilled, IconX } from '@tabler/icons-react';
import { iconStroke } from '../config/config';
import { getFeedbackInit, getFeedbacks, searchFeedbacks } from '../controllers/feedback.controller';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export default function FeedbackPage() {
  const { t } = useTranslation();

  const filters = [
    { key: "today", value: t("feedback.today") },
    { key: "yesterday", value: t("feedback.yesterday") },
    { key: "last_7days", value: t("feedback.last_7days") },
    { key: "this_month", value: t("feedback.this_month") },
    { key: "last_month", value: t("feedback.last_month") },
    { key: "custom", value: t("feedback.custom") },
  ];

  const searchRef = useRef();
  const fromDateRef = useRef();
  const toDateRef = useRef();
  const filterTypeRef = useRef();
  const { theme } = useTheme();

  const now = new Date();
  const defaultDateFrom = `${now.getFullYear()}-${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;
  const defaultDateTo = `${now.getFullYear()}-${(now.getMonth() + 2)
    .toString()
    .padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}`;

  const [state, setState] = useState({
    search: "",
    data: [],
    spage: 1,
    filter: null,
    fromDate: null,
    toDate: null,

    loading: true,
    loved: 0, good: 0, average: 0, bad: 0, worst: 0,
    averageRating: 0, 
    foodRating: 0,
    staffRating: 0,
    ambianceRating: 0,
    serviceRating: 0,
    recommendRating: 0,

    selectedAverageRating: 0, 
    selectedFoodRating: 0,
    selectedStaffRating: 0,
    selectedAmbianceRating: 0,
    selectedServiceRating: 0,
    selectedRecommendRating: 0,
  });

  useEffect(()=>{
    _init();
  }, []);

  const _init = async () => {
    try {
      const res = await getFeedbackInit();

      if(res.status == 200) {
        const initData = res.data;
        
        const overallFeedbackCounting = initData.overallFeedbackCounting;

        const {loved, good, average, bad, worst} = overallFeedbackCounting

        const {
          averageRating,
          foodRating,
          staffRating,
          ambianceRating,
          serviceRating,
          recommendRating,
        } = initData

        setState({
          ...state, 
          loading: false, 
          loved, good, average, bad, worst,
          averageRating,
          foodRating,
          staffRating,
          ambianceRating,
          serviceRating,
          recommendRating,
          data: initData?.feedbacks || []
        });
      }
    } catch (error) {
      console.log(error);
      setState({...state, loading: false});
    }
  }

  const btnSearch = async () => {
    const searchQuery = searchRef.current.value;
    if (!new String(searchQuery).trim()) {
      return;
    }

    try {
      toast.loading(t("feedback.loading_message"));
      const res = await searchFeedbacks(new String(searchQuery).trim());
      if(res.status == 200) {
        toast.dismiss();
        if(res.data?.length > 0) {
          setState({
            ...state,
            search: searchQuery,
            data: res.data,
          });
        } else {
          toast.dismiss();
          toast.error(t("feedback.no_result_found"));
        }
      } else {
        toast.dismiss();
        toast.error(t("feedback.no_result_found"));
      }

    } catch (error) {
      console.error(error);
      const message = error.response.data.message || t("feedback.something_went_wrong");

      toast.dismiss();
      toast.error(message);
    }
  }
  const btnClearSearch = () => {
    searchRef.current.value = null;

    btnResetFilter()
  };

  const _getEmojiFromRating = (rating) => {
    if (rating >= 4.5 && rating <= 5) {
      return '😍'; // People really liked
    } else if (rating >= 3.5 && rating < 4.5) {
      return '🙂'; // People liked your service
    } else if (rating >= 2.5 && rating < 3.5) {
      return '😐'; // Not good, not bad
    } else if (rating >= 1.5 && rating < 2.5) {
      return '🙁'; // Not good
    } else if (rating >= 1.0 && rating < 1.5) {
      return '😠'; // Very bad
    } else {
      return '🤔'; // Default emoji for invalid ratings
    }
  };
  
  const _getTextFromRating = (rating) => {
    if (rating >= 4.5 && rating <= 5) {
      return t("feedback.loved_it"); // 4.5 - 5
    } else if (rating >= 3.5 && rating < 4.5) {
      return t("feedback.good"); // 3.5 - 4.4
    } else if (rating >= 2.5 && rating < 3.5) {
      return t("feedback.average"); // 2.5 - 3.4
    } else if (rating >= 1.5 && rating < 2.5) {
      return t("feedback.bad"); // 1.5 - 2.4
    } else if (rating >= 1.0 && rating < 1.5) {
      return t("feedback.worst"); // 1.0 - 1.4
    } else {
      return 'N/A'; // Default text for invalid ratings
    }
  };

  const btnExport = async () => {
    try {
      toast.loading(t("feedback.loading_message"));

      if(state.data.length == 0) {
        toast.dismiss();
        toast.error(t("feedback.no_result_found"));
        return;
      }
      const feedbacks = state.data;
      const { Parser } = await import("@json2csv/plainjs")
      const { saveAs } = await import("file-saver")
      const opts = {};
      const parser = new Parser(opts);
      const csv = parser.parse(feedbacks);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

      toast.dismiss();

      saveAs(blob, "Feedbacks.csv");
    } catch (error) {
      const message = error?.response?.data?.message || t("feedback.something_went_wrong");
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  }

  const btnView = (item) => {
    setState({
      ...state,
      selectedAverageRating: item.average_rating, 
      selectedFoodRating: item.food_quality_rating,
      selectedStaffRating: item.staff_behavior_rating,
      selectedAmbianceRating: item.ambiance_rating,
      selectedServiceRating: item.service_rating,
      selectedRecommendRating: item.recommend_rating,
    })
    document.getElementById("modal-feedback-view").showModal();
  }

  const btnApplyFilter = async () => {
    const filter = filterTypeRef.current.value;
    const fromDate = fromDateRef.current.value || null;
    const toDate = toDateRef.current.value || null;

    try {
      toast.loading(t("feedback.loading_message"));
      const res = await getFeedbacks(filter, fromDate, toDate);
      if(res.status == 200) {
        toast.dismiss();
        setState({
          ...state,
          filter: filter,
          fromDate: fromDate,
          toDate: toDate,
          data: res?.data || []
        });
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("feedback.something_went_wrong");
      toast.dismiss();
      toast.error(message)
    }
  }

  const btnResetFilter = async () => {
    try {
      toast.loading(t("feedback.loading_message"));
      const res = await getFeedbacks(filters[3].key, null, null);
      if(res.status == 200) {
        toast.dismiss();
        setState({
          ...state,
          filter: null,
          fromDate: null,
          toDate: null,
          search: "",
          data: res?.data || []
        });
      }
    } catch (error) {
      const message = error?.response?.data?.message || t("feedback.something_went_wrong");
      toast.dismiss();
      toast.error(message)
    }
  };

  return (
    <Page className='px-4 py-3 w-full overflow-x-scroll'>
      <div className="flex items-center">
        <h3 className='text-2xl'>{t("feedback.dashboard_title")}</h3>
        <button onClick={()=>document.getElementById('modal-feedback-info').showModal()} className="btn btn-ghost btn-circle btn-xs ml-2 text-gray-500"><IconInfoSquareRoundedFilled stroke={iconStroke} size={18} /></button>
      </div>

      <div className="w-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-4">
        <div className = "md:col-span-2 lg:col-span-2 row-span-2 w-full min-h-72 px-4 py-4 rounded-2xl border border-restro-border-green bg-restro-card-bg">
          <div className="flex items-center justify-between">
            <p className='font-bold'>{t("feedback.overall_feedback")}</p>
            <p className='font-bold text-end'>{t("feedback.peoples")}</p>
          </div>

          <div className="flex items-center justify-between mb-1 mt-2">
            <p className='text-lg flex items-center gap-2'><span className="text-4xl">😍</span> {t("feedback.loved_it")}</p>
            <p>{state.loved}</p>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className='text-lg flex items-center gap-2'><span className="text-4xl">🙂</span> {t("feedback.good")}</p>
            <p>{state.good}</p>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className='text-lg flex items-center gap-2'><span className="text-4xl">😐</span> {t("feedback.average")}</p>
            <p>{state.average}</p>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className='text-lg flex items-center gap-2'><span className="text-4xl">🙁</span> {t("feedback.bad")}</p>
            <p>{state.bad}</p>
          </div>
          <div className="flex items-center justify-between mb-1">
            <p className='text-lg flex items-center gap-2'><span className="text-4xl">😠</span> {t("feedback.worst")}</p>
            <p>{state.worst}</p>
          </div>
        </div>

        <div className=" w-full px-4 py-4 flex flex-col justify-center rounded-2xl border border-restro-border-green bg-restro-card-bg">
          <p className='font-bold'>{t("feedback.overall_feedback")}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className='text-6xl'>{_getEmojiFromRating(state.averageRating)}</p>
            <p className='text-2xl'>{_getTextFromRating(state.averageRating)}</p>
          </div>
        </div>
        <div className = "w-full px-4 py-4 flex flex-col justify-center rounded-2xl border border-restro-border-green bg-restro-card-bg">
          <p className='font-bold'>{t("feedback.food_quality")}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className='text-6xl'>{_getEmojiFromRating(state.foodRating)}</p>
            <p className='text-2xl'>{_getTextFromRating(state.foodRating)}</p>
          </div>
        </div>
        <div className = "w-full px-4 py-4 flex flex-col justify-center rounded-2xl border border-restro-border-green bg-restro-card-bg">
          <p className='font-bold'>{t("feedback.ambiance")}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className='text-6xl'>{_getEmojiFromRating(state.ambianceRating)}</p>
            <p className='text-2xl'>{_getTextFromRating(state.ambianceRating)}</p>
          </div>
        </div>
        <div className=" w-full px-4 py-4 flex flex-col justify-center rounded-2xl border border-restro-border-green bg-restro-card-bg">
          <p className='font-bold'>{t("feedback.staff_behavior")}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className='text-6xl'>{_getEmojiFromRating(state.staffRating)}</p>
            <p className='text-2xl'>{_getTextFromRating(state.staffRating)}</p>
          </div>
        </div>
        <div className="w-full px-4 py-4 flex flex-col justify-center rounded-2xl border border-restro-border-green bg-restro-card-bg">
          <p className='font-bold'>{t("feedback.service")}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className='text-6xl'>{_getEmojiFromRating(state.serviceRating)}</p>
            <p className='text-2xl'>{_getTextFromRating(state.serviceRating)}</p>
          </div>
        </div>
        <div className= "w-full px-4 py-4 flex flex-col justify-center rounded-2xl border border-restro-border-green bg-restro-card-bg">
          <p className='font-bold'>{t("feedback.recommend")}</p>
          <div className="flex items-center gap-2 mt-2">
            <p className='text-6xl'>{_getEmojiFromRating(state.recommendRating)}</p>
            <p className='text-2xl'>{_getTextFromRating(state.recommendRating)}</p>
          </div>
        </div>
      </div>


      <div className="mt-6 mb-6 overflow-x-auto w-full rounded-2xl border border-restro-border-green">
        
        {/* toolbar */}
        <div className="px-4 py-4 flex flex-col md:flex-row flex-wrap md:items-center gap-2 md:justify-between rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 flex items-center rounded-lg bg-restro-card-bg">
              <input
                ref={searchRef}
                defaultValue={state.search}
                type="text"
                placeholder={t("feedback.search_placeholder")}
                className="bg-transparent placeholder:text-gray-400 outline-none block"
              />
              {state.search && (
                <button onClick={btnClearSearch} className="text-gray-400">
                  <IconX stroke={iconStroke} size={18} />
                </button>
              )}
            </div>
            <button
              onClick={btnSearch}
              className="rounded-lg transition active:scale-95 hover:shadow-lg px-4 py-1 text-white bg-restro-green hover:bg-restro-green-button-hover">
              {t("feedback.search_button")}
            </button>
            <button
              onClick={() => document.getElementById("filter-dialog").showModal()}
              className={clsx(
                `w-8 h-8 flex items-center justify-center rounded-full active:scale-95 transition`,
                {
                  "text-gray-500": state.filter == null,
                  "text-restro-green": state.filter != null,
                  "hover:bg-gray-200": theme !== 'black',
                  "hover:bg-restro-bg-hover-dark-mode": theme === 'black',
                }
              )}
            >
              <IconFilter stroke={iconStroke} />
            </button>
          </div>
          <button
            onClick={btnExport}
            className="flex items-center gap-2 transition active:scale-95 px-4 py-1 hover:shadow-lg bg-restro-gray border border-restro-gray rounded-xl hover:bg-restro-button-hover"
          >
            <IconDownload stroke={iconStroke} size={18} />
            <span>{t("feedback.export_button")}</span>
          </button>
        </div>
        {/* toolbar */}

        <table className="w-full table table-sm overflow-x-scroll overflow-y-visible border border-restro-green-light">
          <thead>
            <tr className="px-3 py-2 font-medium md:w-20 bg-restro-gray border border-restro-card-bg">
              <th className="px-3 py-2 font-medium md:w-20 text-start bg-restro-gray border border-restro-green-light">{t("feedback.date")}</th>
              <th className="px-3 py-2 font-medium md:w-40 text-start bg-restro-gray border  border-restro-green-light" >{t("feedback.customer")}</th>
              <th className="px-3 py-2 font-medium md:w-20 text-start bg-restro-gray border  border-restro-green-light">{t("feedback.phone")}</th>
              <th className="px-3 py-2 font-medium md:w-12 text-start bg-restro-gray border  border-restro-green-light">{t("feedback.invoice")}</th>
              <th className="px-3 py-2 font-medium md:w-12 text-start bg-restro-gray border  border-restro-green-light">{t("feedback.overall_feedback")}</th>
              <th className="px-3 py-2 font-medium text-start bg-restro-gray border  border-restro-green-light">{t("feedback.remarks")}</th>
              <th className='text-start px-3 py-2'>{t("feedback.action")}</th>
            </tr>
          </thead>
          <tbody>
            {state.data.map((item, index)=>{
              const {date, phone, name, invoice_id, remarks, average_rating} = item;

              return <tr key={index}>
                <td className='text-start px-3 py-2 text-ellipsis'>{new Date(date).toLocaleDateString()}</td>
                <td className='text-start px-3 py-2 w-40'>
                  <div className='text-ellipsis line-clamp-1'>
                    {name}
                  </div>
                </td>
                <td className='text-start px-3 py-2 text-ellipsis'>{phone}</td>
                <td className='text-start px-3 py-2 text-ellipsis'>#{invoice_id}</td>
                <td className='text-start px-3 py-2 text-ellipsis'>{_getEmojiFromRating(average_rating)} {_getTextFromRating(average_rating)}</td>
                <td className='text-start px-3 py-2 '>
                  <div className='text-ellipsis line-clamp-1'>
                    {remarks}
                  </div>
                  </td>
                <td>
                  <button className="btn btn-sm btn-circle border-none bg-restro-gray hover:bg-restro-button-dark-mode" onClick={()=>{
                    btnView(item);
                  }}><IconEye stroke={iconStroke} size={18} /></button>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      {/* dialog: feedback rating information */}
      <dialog id="modal-feedback-info" className="modal">
        <div className="modal-box border border-restro-border-green rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-center">{t("feedback.understand_feedback")}</h3>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-xs text-restro-red hover:bg-restro-button-hover btn-circle border-none"><IconX size={16} stroke={iconStroke} /></button>
            </form>
          </div>

          <div className="mt-6 flex flex-col">
            <div className="flex items-center gap-4 mb-2">
              <p className="text-lg font-bold w-1/4 text-center rounded-lg p-2 bg-restro-gray">😍 {t("feedback.loved_it")}</p>
              <p className='flex-1 w-3/4 text-sm'>{t("feedback.loved_it_description")}</p>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <p className="text-lg font-bold w-1/4 text-center rounded-lg p-2 bg-restro-gray">🙂 {t("feedback.good")}</p>
              <p className='flex-1 w-3/4 text-sm'>{t("feedback.good_description")}</p>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <p className="text-lg font-bold w-1/4 text-center rounded-lg p-2 bg-restro-gray">😐 {t("feedback.average")}</p>
              <p className='flex-1 w-3/4 text-sm'>{t("feedback.average_description")}</p>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <p className="text-lg font-bold w-1/4 text-center rounded-lg p-2 bg-restro-gray">🙁 {t("feedback.bad")}</p>
              <p className='flex-1 w-3/4 text-sm'>{t("feedback.bad_description")}</p>
            </div>
            <div className="flex items-center gap-4 mb-2">
              <p className="text-lg font-bold w-1/4 text-center rounded-lg p-2 bg-restro-gray">😠 {t("feedback.worst")}</p>
              <p className='flex-1 w-3/4 text-sm'>{t("feedback.worst_description")}</p>
            </div>
          </div>
          
        </div>
      </dialog>
      {/* dialog: feedback rating information */}

      {/* dialog: feedback rating information */}
      <dialog id="modal-feedback-view" className="modal">
        <div  className="modal-box border border-restro-border-green rounded-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-center">{t("feedback.feedback")}</h3>
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="btn btn-xs text-restro-red hover:bg-restro-button-hover btn-circle border-none"><IconX size={16} stroke={iconStroke} /></button>
            </form>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="flex flex-col rounded-2xl px-4 py-3 bg-restro-gray">
              <p>{t("feedback.average_rating")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className='text-4xl'>{_getEmojiFromRating(state.selectedAverageRating)}</p>
                <p className='text-2xl'>{_getTextFromRating(state.selectedAverageRating)}</p>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl px-4 py-3 bg-restro-gray">
              <p>{t("feedback.food_quality")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className='text-4xl'>{_getEmojiFromRating(state.selectedFoodRating)}</p>
                <p className='text-2xl'>{_getTextFromRating(state.selectedFoodRating)}</p>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl px-4 py-3 bg-restro-gray">
              <p>{t("feedback.service")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className='text-4xl'>{_getEmojiFromRating(state.selectedServiceRating)}</p>
                <p className='text-2xl'>{_getTextFromRating(state.selectedServiceRating)}</p>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl px-4 py-3 bg-restro-gray">
              <p>{t("feedback.staff_behavior")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className='text-4xl'>{_getEmojiFromRating(state.selectedStaffRating)}</p>
                <p className='text-2xl'>{_getTextFromRating(state.selectedStaffRating)}</p>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl px-4 py-3 bg-restro-gray">
              <p>{t("feedback.ambiance")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className='text-4xl'>{_getEmojiFromRating(state.selectedAmbianceRating)}</p>
                <p className='text-2xl'>{_getTextFromRating(state.selectedAmbianceRating)}</p>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl px-4 py-3 bg-restro-gray">
              <p>{t("feedback.recommend")}</p>
              <div className="flex items-center gap-2 mt-2">
                <p className='text-4xl'>{_getEmojiFromRating(state.selectedRecommendRating)}</p>
                <p className='text-2xl'>{_getTextFromRating(state.selectedRecommendRating)}</p>
              </div>
            </div>
          </div>
          
        </div>
      </dialog>
      {/* dialog: feedback rating information */}

      {/* filter dialog */}
      <dialog id="filter-dialog" className="modal">
        <div className="modal-box border border-restro-border-green rounded-2xl">
          <h3 className="font-bold text-lg flex items-center">
            <IconFilter stroke={iconStroke} /> {t("feedback.filter_title")}
          </h3>
          {/* filters */}
          <div className="my-4">
            <div>
              <label className=" block text-gray-500 text-sm">{t("feedback.filter_label")}</label>
              <select
                className="select select-sm select-bordered w-full rounded-lg"
                ref={filterTypeRef}
              >
                {filters.map((filter, index) => (
                  <option key={index} value={filter.key}>
                    {filter.value}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 mt-4">
              <div className="flex-1">
                <label
                  htmlFor="fromDate"
                  className=" block text-gray-500 text-sm"
                >
                  {t("feedback.from")}
                </label>
                <input
                  defaultValue={defaultDateFrom}
                  type="date"
                  ref={fromDateRef}
                  className="text-sm w-full border rounded-lg px-4 py-1 bg-restro-card-bg border-restro-border-green outline-restro-border-green-light focus:outline-restro-green-light"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="toDate"
                  className=" block text-gray-500 text-sm"
                >
                  {t("feedback.to")}
                </label>
                <input
                  defaultValue={defaultDateTo}
                  type="date"
                  ref={toDateRef}
                  className= "text-sm w-full border rounded-lg px-4 py-1 bg-restro-card-bg border-restro-border-green outline-restro-border-green-light focus:outline-restro-green-light"
                />
              </div>
            </div>
          </div>
          {/* filters */}
          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button  className="btn ml-2 transition active:scale-95 hover:shadow-lg px-4 py-3 text-restro-text border bg-restro-gray hover:bg-restro-button-hover rounded-xl" onClick={btnResetFilter}>{t("feedback.close")}</button>
              <button onClick={()=>{
                btnApplyFilter();
              }}  className="btn rounded-xl transition active:scale-95 hover:shadow-lg px-4 py-3 text-white ml-3 bg-restro-green hover:bg-restro-green-button-hover"
              >{t("feedback.apply")}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* filter dialog */}

    </Page>
  )
}
