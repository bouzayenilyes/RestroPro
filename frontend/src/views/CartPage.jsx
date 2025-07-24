import React, { useState, useEffect , useRef, useContext} from 'react';
import { IconChevronRight, IconCarrot, IconTrash, IconMinus, IconPlus, IconShoppingCartX, IconMoodEmptyFilled, IconChevronLeft, IconCheck, IconX, IconTable, IconShovelPitchforks, IconDoor, IconNote } from '@tabler/icons-react';
import { createOrderFromQrMenu, getCart, setCart } from '../controllers/qrmenu.controller';
import { getImageURL } from '../helpers/ImageHelper';
import { iconStroke } from '../config/config';
import { useLocation, useParams , useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
import { validatePhone } from '../utils/phoneValidator';
import { SocketContext } from '../contexts/SocketContext';
import { initSocket } from '../utils/socket';
import { useTranslation } from 'react-i18next';
import {useTheme} from '../contexts/ThemeContext';

const CartPage = () => {
  const { t } = useTranslation();
  const { socket, isSocketConnected } = useContext(SocketContext);

  const [state, setState] = useState({ cartItems: [], itemsTotal: 0, taxTotal: 0, serviceChargeTotal: 0, payableTotal: 0 });
  const [showPhoneFields, setShowPhoneFields] = useState(false);
  const [selectedCustomerType, setSelectedCustomerType] = useState(null);
  const params = useParams();
  const qrcode = params.qrcode;
  const navigate = useNavigate();

  const location = useLocation();
  const { storeTable , currency , serviceCharge } = location.state || null;

  const nameRef = useRef(null);
  const phoneRef = useRef(null);

  // dialog: notes ref
  const dialogNotesIndexRef = useRef();
  const dialogNotesTextRef = useRef();

  useEffect(() => {
    const storedCart = getCart() || [];
    const { itemsTotal, taxTotal, serviceChargeTotal, payableTotal } = calculateOrderSummary(storedCart);
    setState((prevState) => ({
      ...prevState,
      itemsTotal,
      taxTotal,
      serviceChargeTotal,
      payableTotal,
      cartItems: storedCart
    }));
  }, []);

  const { cartItems, itemsTotal, taxTotal, serviceChargeTotal, payableTotal } = state;

  const sendNewOrderEvent = () => {
    if (isSocketConnected) {
      socket.emit('new_qrorder_backend', {}, qrcode);
    } else {
      // Handle disconnected state (optional)
      initSocket();
      socket.emit('new_qrorder_backend', {}, qrcode);
    }
  }

  function removeItemFromCart(index) {
    const newCartItems = cartItems.filter((_, i) => i !== index);
    setCart(newCartItems);
    updateCart(newCartItems);
  }

  function addCartItemQuantity(index, currentQuantity) {
    const newQuantity = currentQuantity + 1;
    const newCartItems = [...cartItems];
    newCartItems[index].quantity = newQuantity;
    setCart(newCartItems);
    updateCart(newCartItems);
  }

  function minusCartItemQuantity(index, currentQuantity) {
    const newQuantity = currentQuantity - 1;
    let newCartItems = [...cartItems];
    newCartItems[index].quantity = newQuantity;

    if (newQuantity === 0) {
      newCartItems = newCartItems.filter((_, i) => i !== index);
    }

    setCart(newCartItems);
    updateCart(newCartItems);
  }

  const updateCart = (items) => {
    const { itemsTotal, taxTotal, payableTotal } = calculateOrderSummary(items);
    setState({ ...state, cartItems: items, itemsTotal, taxTotal, payableTotal });
  };

  const calculateOrderSummary = (items) => {
    let itemsTotal = 0;
    let taxTotal = 0;
    let serviceChargeTotal = 0;
    let payableTotal = 0;

    items.forEach((item) => {
      const taxRate = Number(item.tax_rate);
      const taxType = item.tax_type;
      const itemPrice = Number(item.price) * Number(item.quantity);

      if (taxType === 'exclusive') {
        const tax = (itemPrice * taxRate) / 100;
        taxTotal += tax;
        itemsTotal += itemPrice;
        payableTotal += itemPrice + tax;
      } else if (taxType === 'inclusive') {
        const tax = itemPrice - (itemPrice * (100 / (100 + taxRate)));
        taxTotal += tax;
        itemsTotal += itemPrice - tax;
        payableTotal += itemPrice;
      } else {
        itemsTotal += itemPrice;
        payableTotal += itemPrice;
      }
    });

     // Calculate Total Service charge % from items total
     if (serviceCharge) {
      let calculatedServiceCharge = (Number(itemsTotal) * Number(serviceCharge)) / 100;
      serviceChargeTotal += calculatedServiceCharge;
      payableTotal += calculatedServiceCharge;
    }

    return { itemsTotal, taxTotal, serviceChargeTotal, payableTotal };
  };

    const btnPlaceOrder = async () => {

      if (showPhoneFields) {
        const phone = phoneRef.current?.value || "";
        const name = nameRef.current?.value || "";

        if (!name.trim()) {
          toast.error(t('cart.name_required'));
          return;
        }

        if (!validatePhone(phone)) {
          toast.error(t('cart.valid_phone_error'));
          return;
        }
      }

    try {
      const deliveryType = null;
      const tableId = storeTable?.id || null;
      const customerType = showPhoneFields ? "CUSTOMER" : "WALKIN";
      const customer = showPhoneFields
        ? {
            name: nameRef.current?.value || "",
            phone: phoneRef.current?.value || "",
          }
        : { name: "Guest", phone: "" };

      toast.loading(t('cart.please_wait'));

      const res = await createOrderFromQrMenu(deliveryType , cartItems, customerType, customer, tableId , qrcode);
      toast.dismiss();
      if(res.status == 200) {
        const data = res.data;
        toast.success(t('cart.order_success'));
        document.getElementById("modal-place-order").close();


        setState({
          ...state,
          cartItems: [],
        })

        setCart([]);

        setSelectedCustomerType(null);
        sendNewOrderEvent();

        navigate('/m/order-success');
      }
    } catch (error) {
      const message = error?.response?.data?.message || t('cart.something_went_wrong');
      console.error(error);

      toast.dismiss();
      toast.error(message);
      navigate('/m/order-failed');
    }
  };

    // order notes
    const btnOpenNotesModal = (index, notes) => {
      dialogNotesIndexRef.current.value = index;
      dialogNotesTextRef.current.value = notes;
      document.getElementById('modal-notes').showModal()
    }
    const btnAddNotes = () => {
      const index = dialogNotesIndexRef.current.value;
      const notes = dialogNotesTextRef.current.value || null;

      const newCartItems = cartItems;
      newCartItems[index].notes = notes;

      setState({
        ...state,
        cartItems: newCartItems
      })
    };

  return (
    <div className='w-full'>
      <div className='container w-full max-w-5xl mx-auto flex justify-center items-center'>
          <div className="w-full mx-auto max-w-5xl bg-gray-50 dark:bg-black rounded-xl p-4 h-screen border border-restro-green-light"> {/* Centered cart container */}
          <div className="relative flex items-center justify-between p-4shadow-md">
          {/* Back Button */}
          <button className="absolute left-0 p-2" onClick={() => window.history.back()}>
            <IconChevronLeft size={24} stroke={2} /> {/* Back arrow icon */}
          </button>

          {/* Centered Title */}
          <h3 className="text-xl md:text-2xl font-bold text-center w-full">{t('cart.title')}</h3>
        </div>


        {storeTable && (
          <div className="flex items-center gap-2 mt-4 p-2 justify-center bg-white dark:bg-black rounded-lg shadow-sm">
            <IconShovelPitchforks size={20} stroke={2} className="text-gray-700" />

            <h3 className="text-lg font-semibold">
              <span className="font-bold text-gray-800">{storeTable.table_title}</span>
            </h3>

            {storeTable.floor && (
              <p className="text-md text-gray-600">
                <span className="font-semibold">( {storeTable.floor})</span>
              </p>
            )}
          </div>
        )}


        {/* Cart Items */}
        <div className="mt-4">
          {cartItems.length > 0 ? (
            cartItems.map((item, i) => {
              const { id, title, price, quantity, image , notes} = item;
              const imageURL = getImageURL(image);

              return (
                <div key={i} className="w-full bg-white dark:bg-black rounded-lg p-2 mb-2 md:mb-4 flex items-center justify-between">
                  <div className="flex items-start">
                    <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-200 dark:bg-black rounded-lg overflow-hidden mr-4 md:mr-6 object-cover flex items-center justify-center text-gray-500 flex-shrink-0">
                      {image ? (
                        <img src={imageURL} alt={title} className="object-cover w-full h-full" />
                      ) : (
                        <IconCarrot size={24} />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-sm font-semibold md:text-lg line-clamp-2 text-ellipsis">{title}</p>
                      <div className="text-xs text-gray-400 md:text-sm">
                       {item?.variant?.title && <p>{item.variant.title}</p>}
                        {item.addons?.length > 0 && <p>{item.addons.length} Addons</p>}
                      </div>
                      <p className="text-sm md:text-lg">{currency}{(price * quantity).toFixed(2)}</p>
                      {notes && <p className='text-xs text-gray-500 md:text-sm'>{t('cart.notes')}: {notes}</p>}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                  <div className="flex items-center">
                    <button
                      onClick={() => minusCartItemQuantity(i, quantity)}
                      className="btn btn-square btn-xs md:btn-sm rounded-lg"
                    >
                      <IconMinus stroke={iconStroke} size={14}/>
                    </button>

                    <div className="text-center text-sm w-6 md:text-xl rounded-lg">{quantity}</div>

                    <button
                      onClick={() => addCartItemQuantity(i, quantity)}
                      className="btn btn-square btn-xs md:btn-sm rounded-lg"
                    >
                      <IconPlus stroke={iconStroke} size={14} />
                    </button>

                    <button
                      onClick={() => removeItemFromCart(i)}
                      className="text-restro-red hover:text-red-700 transition ml-4 w-4 h-4 md:w-8 md:h-8"
                    >
                      <IconTrash stroke={iconStroke} className='w-full h-full'/>
                    </button>
                  </div>

                  <button
                    onClick={() => {btnOpenNotesModal(i, notes)}}
                    className="text-sm md:text-md transition active:scale-95 hover:shadow-lg px-2 py-1 flex md:px-4 md:py-1 items-center gap-1 mt-4 ml-auto rounded-xl border border-restro-border-green bg-restro-card-bg hover:bg-restro-button-hover text-restro-text' "
                  >
                    <IconNote size={18} stroke={iconStroke} />
                    <p className='text-sm md:text-lg'>{t('cart.add_notes')}</p>
                  </button>
                </div>


                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-500 flex flex-col justify-center items-center h-[85vh] gap-4">
              <IconShoppingCartX size={50} />
              <p className='text-xl'>{t('cart.empty_cart')}</p>
            </div>
          )}
        </div>

        {/* Order Summary Section */}
        {cartItems.length > 0 && (
          <div className="join join-vertical w-full">
            <div className="collapse collapse-arrow join-item bg-white dark:bg-black">
              <input type="checkbox" className="peer" />
              <div className="collapse-title text-lg md:text-xl font-bold flex justify-between">
                <span>{t('cart.payable_total')}</span>
                <span className='text-restro-green font-bold'>{currency}{payableTotal.toFixed(2)}</span>
              </div>
              <div className="collapse-content space-y-2 text-sm md:text-md">
                <div className="flex justify-between">
                  <span>{t('cart.items_total')}</span>
                  <span>{currency}{itemsTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.tax_total')}</span>
                  <span>{currency}{taxTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('cart.service_charge_total')}</span>
                  <span>{currency}{serviceChargeTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      <div className="h-28"/>

        {/* Checkout Section */}
        {cartItems.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black shadow-lg p-4 flex justify-between items-center rounded-2xl max-w-5xl mx-auto">
            <button
            onClick={() => {
              document.getElementById('modal-place-order').showModal();
            }}
            className="bg-restro-green text-white py-4 px-6 rounded-xl flex justify-between w-full items-center">
              <p className="text-md font-bold md:text-lg">{t('cart.total')} {currency}{payableTotal.toFixed(2)}</p>
              <p className="text-white text-lg md:text-xl font-bold px-2 rounded-lg flex items-center">
                {t('cart.checkout')} <IconChevronRight size={20} stroke={3} />
              </p>
            </button>
          </div>
        )}
      </div>


      <dialog id="modal-place-order" className="modal modal-bottom sm:modal-middle w-full mx-auto max-w-5xl">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>

          <div className="my-2 mx-auto w-full relative">
            <h3 className='text-center text-xl font-semibold'>{t('cart.continue_as')}</h3>

            <div className="absolute top-0 right-0 text-red-400 cursor-pointer">
              <button onClick={() => {document.getElementById('modal-place-order').close()}}>
                <IconX size={20} />
              </button>
            </div>

            <div className="flex flex-col justify-around mt-4">
              <button
                className={`rounded-lg transition px-4 py-3 text-lg font-semibold  border-2 ${
                  !showPhoneFields ? 'bg-white dark:bg-black border-restro-green text-restro-green shadow-sm' : 'bg-gray-100 dark:bg-black text-gray-600 hover:bg-gray-200'
                }`}
                onClick={() => setShowPhoneFields(false)}
              >
                {t('cart.guest')}
              </button>

              <div className="relative flex items-center justify-center my-6">
                <div className="border-t border-restro-border-green w-full"></div>
                <span className="absolute bg-white dark:bg-black px-4 text-gray-500 text-sm">{t('cart.or')}</span>
              </div>

              <button
                className={`rounded-lg transition px-4 py-3 text-lg font-semibold  border-2 ${
                  showPhoneFields ? 'bg-white dark:bg-black border-restro-green text-restro-green shadow-sm ' : 'bg-gray-100 dark:bg-black text-restro-text hover:bg-gray-200 border-restro-border-green'
                }`}
                onClick={() => setShowPhoneFields(true)}
              >
                {t('cart.using_phone_number')}
              </button>
            </div>

            {showPhoneFields && (
              <div className="mt-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">{t('cart.name_label')} <span className="text-xs text-gray-400">- (Required)</span></label>
                  <input
                    type="text"
                    ref={nameRef}
                    className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                    placeholder={t('cart.name_placeholder')}
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">{t('cart.phone_label')} <span className="text-xs text-gray-400">- (Required)</span></label>
                  <input
                    type="tel"
                    ref={phoneRef}
                    className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green'
                    placeholder={t('cart.phone_placeholder')}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="modal-action justify-center w-full">
            <button
              onClick={() => {btnPlaceOrder()}}
              className="rounded-lg hover:bg-restro-green-dark transition active:scale-95 hover:shadow-lg px-4 py-4 bg-restro-green text-white w-full text-xl font-semibold"
            >
              {t('cart.place_order')}
            </button>
          </div>
        </div>
      </dialog>


      {/* dialog: notes */}
      <dialog id="modal-notes" className="modal modal-bottom sm:modal-middle">
        <div className='modal-box border border-restro-border-green dark:rounded-2xl'>
          <h3 className="font-bold text-lg">{t('cart.add_notes')}</h3>

          <div className="my-4">
            <input type="hidden" ref={dialogNotesIndexRef} />
            <label htmlFor="dialogNotesText" className="mb-1 block text-gray-500 text-sm">{t('cart.notes')} <span className="text-xs text-gray-500">(100 character max.)</span></label>
            <input ref={dialogNotesTextRef} type="text" name="dialogNotesText" id='dialogNotesText' className='text-sm w-full rounded-lg px-4 py-2 border border-restro-border-green dark:bg-black focus:outline-restro-border-green' placeholder={t('cart.notes_placeholder')} />
          </div>

          <div className="modal-action">
            <form method="dialog">
              {/* if there is a button in form, it will close the modal */}
              <button className="rounded-lg transition active:scale-95 hover:shadow-lg px-4 py-3 bg-restro-gray hover:bg-restro-button-hover text-restro-text">{t('cart.close')}</button>
              <button onClick={()=>{btnAddNotes();}} className="rounded-lg hover:bg-green-800 transition active:scale-95 hover:shadow-lg px-4 py-3 bg-restro-green text-white ml-3">{t('cart.save')}</button>
            </form>
          </div>
        </div>
      </dialog>
      {/* dialog: notes */}


      </div>

    </div>
  );
};

export default CartPage;
