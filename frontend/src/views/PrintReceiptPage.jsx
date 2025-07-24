import React from 'react'
import { getDetailsForReceiptPrint } from '../helpers/ReceiptHelper'
import { getImageURL } from "../helpers/ImageHelper";
import { useTranslation } from "react-i18next";

export default function PrintReceiptPage() {
  const { t } = useTranslation();
  const receiptDetails = getDetailsForReceiptPrint();

  const { cartItems, deliveryType, customerType, customer, tableId, currency, storeSettings, printSettings,
    itemsTotal,
    taxTotal,
    serviceChargeTotal,
    payableTotal,
    tokenNo,
    orderId,
    paymentMethod
  } = receiptDetails;

  const {
    store_name,
    address,
    phone,
    email,
    store_image : storeImage,
  } = storeSettings;

  const {
    page_format,
    header,
    footer,
    show_notes,
    show_store_details,
    show_customer_details,
    print_token,
  } = printSettings;

  return (
    <div className={`w-[${page_format}mm] font-sans px-2 bg-white text-black`}>

      {show_store_details == 1 ? <>

        {storeImage && (
          <img
            src={getImageURL(storeImage)}
            className='w-12 h-12 mx-auto filter grayscale mt-2 rounded-xl'
            alt="Store Image"
          />
        )}
        <p className="text-center mt-2">
          {store_name}<br/>
          {address}<br/>
          {t("print_receipt.phone")}: {phone}, {t("print_receipt.email")}: {email}<br/>
        </p>
      </>:<></>}

      {header && <div className=''>
        <div className="border-b border-dashed"></div>
        <p className='my-2 text-center'>{header}</p>
      </div>}

      {
        show_customer_details == 1 ? <>
          <div className="border-b border-dashed"></div>
          <p className='text-center'>{customerType}{customer&&<span>, {customer?.name}</span>}</p>
          <p className='mt-1'>{t("print_receipt.order_type")}: {deliveryType}</p>
        </>:<></>
      }

      {
        paymentMethod && <>
          <div className="border-b border-dashed"></div>
          <p className='mt-1'>{t("print_receipt.payment_method")}: {paymentMethod}</p>
        </>
      }

      <div className="border-b border-dashed mt-2"></div>
      <p>{t("print_receipt.receipt_no")}: {tokenNo}-{new Date().toISOString().substring(0,10)}</p>
      <p>{new Date().toLocaleString()}</p>

      <div className="border-b border-dashed mt-2"></div>
      {cartItems.map((cartItem, index)=>{

        const {title, quantity, notes, price, tax_rate, tax_type, tax_title, addons, addons_ids, variant } = cartItem;

        return <div key={index} className='w-full my-1'>
          <p>{title} {variant && <span>- {variant.title}</span>}</p>
          {addons_ids?.length > 0 && <p className='text-xs'>{t("print_receipt.addons")}:
          {addons_ids.map((addonId, index)=>{
            const addon = addons.find((a)=>a.id==addonId);
            return addon.title;
          })?.join(", ")}
          </p>}
          {(show_notes == 1 && notes) ? <p className='mb-2 text-xs'>{t("print_receipt.notes")}: {notes}</p>:<></>}
          <div className='flex justify-between w-full'>
            <p className='text-sm'>{quantity}x {currency}{Number(price).toFixed(2)}</p>
            <p className='text-end'>{currency}{Number(quantity*price).toFixed(2)}</p>
          </div>
        </div>
      })}
      <div className="border-b border-dashed mt-2"></div>

      <div className="flex justify-between">
        <p>{t("print_receipt.subtotal")}: </p>
        <p>{currency}{Number(itemsTotal).toFixed(2)}</p>
      </div>
      <div className="flex justify-between">
        <p>{t("print_receipt.tax")}: </p>
        <p>{currency}{Number(taxTotal).toFixed(2)}</p>
      </div>
      <div className="flex justify-between">
        <p>{t("print_receipt.service_charge")}: </p>
        <p>{currency}{Number(serviceChargeTotal).toFixed(2)}</p>
      </div>
      <div className="flex justify-between text-xl font-bold">
        <p>{t("print_receipt.total")}: </p>
        <p>{currency}{Number(payableTotal).toFixed(2)}</p>
      </div>

      <div className="border-b border-dashed mt-2"></div>

      {footer && <div className='my-2'>
        <p className='my-2 text-center'>{footer}</p>
      </div>}


      {print_token == 1 && tokenNo ? <div className='border-t border-dashed mt-4 py-12 text-center bg-white'>
        {t("print_receipt.token_no")}
        <div className="w-28 h-28 mx-auto border-black border-2 text-black flex items-center justify-center font-bold text-4xl rounded-full">
          {tokenNo}
        </div>
      </div>:<></>}

    </div>
  )
}
