import React, { useState } from "react";
import clsx from "clsx";
import RatingComponent from '../components/RatingComponent'
import { IconArrowRight, IconChevronRight } from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import toast from "react-hot-toast";
import { IconUser, IconPhone, IconMail, IconCalendar, IconSend } from "@tabler/icons-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { saveFeedback } from "../controllers/qrmenu.controller";
import { useTranslation } from 'react-i18next';
import { useTheme } from "../contexts/ThemeContext";

export default function FeedbackCollectPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const questions = [
    { 
      name: "food_quality", 
      text: t('feedback.food_quality_question'), 
      greeting: t('feedback.food_quality_greeting') 
    },
    { 
      name: "service", 
      text: t('feedback.service_question'), 
      greeting: t('feedback.service_greeting') 
    },
    { 
      name: "staff_behavior", 
      text: t('feedback.staff_behavior_question'), 
      greeting: t('feedback.staff_behavior_greeting') 
    },
    { 
      name: "ambiance", 
      text: t('feedback.ambiance_question'), 
      greeting: t('feedback.ambiance_greeting') 
    },
    { 
      name: "recommend", 
      text: t('feedback.recommend_question'), 
      greeting: t('feedback.recommend_greeting') 
    },
  ];

  const [searchParams, setSearchParams] = useSearchParams();
  const params = useParams();
  const navigate = useNavigate();

  const qrcode = params.qrcode;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [responses, setResponses] = useState({}); // State to store responses
  const [userDetails, setUserDetails] = useState({ name: "", email: "", phone: "", birthdate: "", remarks: "" }); // State for user details

  const invoiceId = searchParams.get("_ref") || null;
  const customerId = searchParams.get("_cref") || null;

  const handleNext = () => {
    if (currentQuestion < questions.length) {
      const selectedValue = document.querySelector(
        `input[name="${questions[currentQuestion].name}"]:checked`
      )?.value;

      if (!selectedValue) {
        toast.error(t('feedback.select_option_error'));
        return;
      }

      setResponses((prev) => ({
        ...prev,
        [questions[currentQuestion].name]: selectedValue,
      }));

      document.getElementsByName(questions[currentQuestion].name).forEach((item)=>{
        item.checked = false;
      })

      setTransitioning(true);
      setTimeout(() => {
        setCurrentQuestion((prev) => prev + 1);
        setTransitioning(false);
      }, 300); // Duration matches the Tailwind transition
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async () => {
    if(!customerId) {
      if (!userDetails.name || !userDetails.phone) {
        toast.error(t('feedback.fill_required_fields_error'));
        return;
      }
    }

    const {
      food_quality,
      service,
      staff_behavior,
      ambiance,
      recommend
    }=responses;

    try {
      toast.loading(t('feedback.loading_message'));

      const res = await saveFeedback(qrcode, invoiceId, customerId, userDetails.name, userDetails.phone, userDetails.email, userDetails.birthdate, food_quality, service, ambiance, staff_behavior, recommend, userDetails.remarks);

      if(res.status == 200) {
        toast.dismiss();
        toast.success(res.data.message);
        navigate('success', {replace: true})
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('feedback.error_saving_details');
      console.error(error);

      toast.dismiss();
      toast.error(message);
    }
  };
  
  return (
    <div
      className={clsx(
        'w-full h-screen overflow-x-hidden overflow-y-auto',
        theme === "black" ? "bg-black" : "bg-gray-100"
      )}
    >
      <div className={clsx(
        "container mx-auto px-4 py-3 w-full md:w-[30rem] md:px-6 md:py-5"
      )}>
        
      {currentQuestion < questions.length ? (
          <>
            <h3 className={clsx(
              "font-bold text-2xl mt-10",
              theme === "black" ? "text-white" : "text-black"
            )}>{t('feedback.provide_feedback')}</h3>
            <div
              className={clsx(
                "relative w-full py-4 px-4 md:py-6 md:px-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out mt-6 flex flex-col",
                transitioning && "translate-x-full opacity-0",
                !transitioning && "translate-x-0 opacity-100",
                theme === "black" ? "bg-[#232323]" : "bg-white"
              )}
            >
              <p className={clsx(
                "text-lg",
                theme === "black" ? "text-gray-100" : "text-gray-800"
              )}>{questions[currentQuestion].text}</p>
              <p className={clsx(
                "text-xs italic mt-1 mb-2",
                theme === "black" ? "text-gray-400" : "text-gray-500"
              )}>"{questions[currentQuestion].greeting}"</p>

              <RatingComponent name={questions[currentQuestion].name} theme={theme} />

              <button
                onClick={handleNext}
                className="self-end mt-4 px-4 py-2 bg-restro-green text-white rounded-lg hover:bg-restro-green-dark flex items-center gap-1"
              >
                {t('feedback.next')} <IconArrowRight stroke={iconStroke} size={18} />
              </button>
            </div>

          </>
        ) : (
          <>
            {!customerId && <h3 className={clsx(
              "font-bold text-2xl mt-10",
              theme === "black" ? "text-white" : "text-black"
            )}>{t('feedback.enter_details')}</h3>}
            <div className={clsx(
              "relative w-full py-4 px-4 md:py-6 md:px-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out mt-6",
              theme === "black" ? "bg-restro-gray-dark-mode" : "bg-white"
            )}>
              {!customerId && <>
              <label htmlFor="name" className="block font-medium">
                {t('feedback.name_label')} <span className="text-xs text-gray-400">- {t('feedback.required')}</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder={t('feedback.name_placeholder')}
                className='text-sm w-full border rounded-lg px-4 py-2 bg-restro-card-bg border-restro-border-green disabled:text-gray-400 outline-restro-border-green-light'
                value={userDetails.name}
                onChange={handleInputChange}
              />

              <label htmlFor="phone" className="block mt-4 font-medium">
                {t('feedback.phone_label')} <span className="text-xs text-gray-400">- {t('feedback.required')}</span>
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder={t('feedback.phone_placeholder')}
                className='text-sm w-full border rounded-lg px-4 py-2 bg-restro-card-bg border-restro-border-green disabled:text-gray-400 outline-restro-border-green-light'
                value={userDetails.phone}
                onChange={handleInputChange}
              />

              <label htmlFor="email" className="block mt-4 font-medium">
                {t('feedback.email_label')}
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder={t('feedback.email_placeholder')}
                className='text-sm w-full border rounded-lg px-4 py-2  bg-restro-card-bg border-restro-border-green disabled:text-gray-400 outline-restro-border-green-light'
                value={userDetails.email}
                onChange={handleInputChange}
              />

              <label htmlFor="birthdate" className="block mt-4 font-medium">
                {t('feedback.birthdate_label')}
              </label>
              <input
                type="date"
                name="birthdate"
                id="birthdate"
                placeholder={t('feedback.birthdate_placeholder')}
                className='text-sm w-full border rounded-lg px-4 py-2 disabled:text-gray-400 bg-restro-card-bg border-restro-border-green outline-restro-border-green-light '
                value={userDetails.birthdate}
                onChange={handleInputChange}
              />
              </>}

              <label htmlFor="remarks" className="block font-medium mt-4">
                {t('feedback.remarks_label')}
              </label>
              <textarea
                name="remarks"
                id="remarks"
                placeholder={t('feedback.remarks_placeholder')}
                className='text-sm w-full border rounded-lg px-4 py-2 disabled:text-gray-400 bg-restro-card-bg border-restro-border-green outline-restro-border-green-light '
                value={userDetails.remarks}
                onChange={handleInputChange}
              />

              <button
                onClick={handleFormSubmit}
                className='w-full rounded-lg transition active:scale-95 hover:shadow-lg px-4 py-3 text-white mt-4 bg-restro-green hover:bg-restro-green-button-hover'
              >
                {t('feedback.submit')}
              </button>
            </div>
          </>
        )}

      </div>

      <div className="absolute w-full top-0 left-0 right-0 flex justify-center">
        <div className={clsx(
          "w-full h-2",
          theme === "black" ? "bg-[#232323]" : "bg-gray-200"
        )}>
          <div
            className="bg-restro-green h-2 transition-all duration-300"
            style={{
              width: `${Math.min(
                ((currentQuestion + 1) / (questions.length + 1)) * 100,
                100
              )}%`,
            }}
          />
        </div>
      </div>

    </div>
  )
}
