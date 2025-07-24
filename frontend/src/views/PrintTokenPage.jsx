import React from "react";
import { getDetailsForReceiptPrint } from "../helpers/ReceiptHelper";
import { useTranslation } from "react-i18next";

export default function PrintTokenPage() {
  const { t } = useTranslation();
  const receiptDetails = getDetailsForReceiptPrint();

  const {
    // cartItems,
    // deliveryType,
    // customerType,
    // customer,
    // tableId,
    // currency,
    storeSettings,
    printSettings,
    // itemsTotal,
    // taxTotal,
    // payableTotal,
    tokenNo,
    // orderId,
  } = receiptDetails;

  // const {
  //   store_name,
  //   address,
  //   phone,
  //   email,
  //   image: storeImage,
  // } = storeSettings;

  // const {
  //   page_format,
  //   header,
  //   footer,
  //   show_notes,
  //   show_store_details,
  //   show_customer_details,
  //   print_token,
  // } = printSettings;

  const page_format = printSettings?.page_format || 80;

  return (
    <div className={`w-[${page_format}mm] font-sans px-2 bg-white text-black`}>
      <div className="mt-4 py-8 text-center">
        {t("print_token.token_no")}
        <div className="w-28 h-28 mx-auto border-black border-2 text-black flex items-center justify-center font-bold text-4xl rounded-full">
          {tokenNo}
        </div>
      </div>

      <p className="mt-2 text-center">{new Date().toLocaleString('en-US', {hour12: true, dateStyle: "long", timeStyle: "short"})}</p>
    </div>
  );
}
