import React from 'react'
import { IconCircleCheckFilled } from "@tabler/icons-react";
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';

export default function FeedbackCollectSuccessPage() {
  const { t } = useTranslation();
  const { theme } = useTheme();

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-4">
      <div className="w-full md:w-96 mx-auto max-w-sm shadow-lg rounded-xl px-10 py-8 flex flex-col justify-between">
        <div className="text-center mb-6">
          <p className='text-sm text-restro-text'>
            {t('feedback_success.thank_you_message')}
          </p>
        </div>

        <div className="text-center mb-6">
          <IconCircleCheckFilled className="text-restro-green mx-auto" size={150} />
          <p className='text-md tracking-wide mt-2 font-bold text-restro-text'>
            {t('feedback_success.feedback_saved_message')}
          </p>
        </div>
      </div>
    </div>
  )
}
