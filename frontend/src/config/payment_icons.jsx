import { IconBrandPaypal, IconBuildingBank, IconCash, IconCreditCard, IconDeviceIpad, IconDiscount, IconQrcode, IconWallet } from "@tabler/icons-react";
import { iconStroke } from "./config";

export const PAYMENT_ICONS = {
    'cash': <IconCash stroke={iconStroke} />,
    'card': <IconCreditCard stroke={iconStroke} />,
    'wallet': <IconWallet stroke={iconStroke} />,
    'paypal': <IconBrandPaypal stroke={iconStroke} />,
    'qrcode': <IconQrcode stroke={iconStroke} />,
    'reader': <IconDeviceIpad stroke={iconStroke} />,
    'bank': <IconBuildingBank stroke={iconStroke} />,
    'discount': <IconDiscount stroke={iconStroke} />,
}