import React from 'react';
import { getImageURL } from '../helpers/ImageHelper';
import { IconAlertTriangleFilled, IconCarrot } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useTheme } from '../contexts/ThemeContext';


const POSMenuItemDetailedView = ({ menuItems, selectedCategory, categories, searchQuery, currency, btnOpenVariantAndAddonModal, addItemToCart }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const filteredMenuItems = menuItems.filter((menuItem) => menuItem.is_enabled)
    .filter((menuItem) => {
      if (selectedCategory === "all") {
        return !menuItem.category_id || categories.find(category => category.id === menuItem.category_id && category.is_enabled);
      }
      return selectedCategory === menuItem.category_id;
    })
    .filter((menuItem) => {
      if (!searchQuery) {
        return true;
      }
      return menuItem.title.trim().toLowerCase().includes(searchQuery.trim().toLowerCase());
    });

  return (
    <div className='w-full h-full overflow-hidden'>
      {filteredMenuItems.length === 0 ? (
        <div className="flex flex-col justify-center items-center w-full h-full">
          <img src="/assets/illustrations/pos-not-found.webp" alt={t('pos.not_found_img_alt')} className="w-1/4 mb-4" />
          <p className="text-lg text-restro-green font-bold">{t("pos_menu.not_found_title")}</p>
          <p className="text-gray-500">{t("pos_menu.not_found_message")}</p>
          <p className="text-gray-500">{t("pos_menu.not_found_carrot")}</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 w-full z-0 px-4 pb-4 rounded-b-2xl overflow-y-auto h-full content-start '>
          {filteredMenuItems.map((menuItem, i) => {
            const { title, description, id, price, image, category_id, category_title, addons, variants } = menuItem;

            const imageURL = image ? getImageURL(image) : null;
            const hasVariantOrAddon = variants?.length > 0 || addons?.length > 0;

            const baseRecipeItems = menuItem.recipeItems?.filter(
              (r) => r.variant_id === 0 && r.addon_id === 0
            );

            const isLowStock = baseRecipeItems?.some(
              (r) => parseFloat(r.current_quantity) <= parseFloat(r.min_quantity_threshold)
            );

            const quantitiesPossible = baseRecipeItems.map(r => {
              const currentQty = parseFloat(r.current_quantity || "0");
              const requiredQty = parseFloat(r.recipe_quantity || "1");
              return Math.floor(currentQty / requiredQty);
            });

            const minItemsCanBeMade = quantitiesPossible.length > 0
              ? Math.min(...quantitiesPossible)
              : null;

            return (
              <div className='flex gap-2 min-h-32 max-h-36 border rounded-2xl border-restro-border-green text-restro-text' key={i}>
                <div>
                  <div className='w-28 flex-shrink-0 h-full hidden md:flex items-center justify-center text-gray-300 relative rounded-l-2xl text-restro-text bg-restro-gray'>
                    {image ? <img src={imageURL} alt={title} className="w-full h-full absolute top-0 left-0 rounded-l-2xl object-cover " /> : <IconCarrot />}
                    {category_title && (
                      <div className="absolute top-0 left-0 bg-restro-green-dark text-white text-xs font-semibold px-2 py-1 rounded-tl-xl rounded-br-lg">
                        {category_title}
                      </div>
                    )}
                    {isLowStock && (
                      <div className="absolute left-0 bottom-0 bg-amber-50 text-amber-600 text-[10px] font-medium px-1 py-[1px] z-10 w-full flex flex-col items-center gap-[2px] rounded-bl-2xl">
                        <div className="flex items-center gap-1">
                          <IconAlertTriangleFilled size={12} />
                          <span>Low Stock - {minItemsCanBeMade} Qty</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-2 flex flex-col justify-between gap-2 w-full">
                  <div>
                    <div className='flex justify-between gap-4 mr-1'>
                      <p className='line-clamp-1 text-sm text-ellipsis font-semibold w-[75%]'>{title}</p>
                      <p className='text-restro-green font-bold'>{currency}{price}</p>
                    </div>
                    <p className='line-clamp-2 text-ellipsis text-xs text-gray-500 mt-0.5'>{description}</p>
                  </div>
                  <div className="flex justify-between items-end gap-4 w-full">
                    <p className="text-xs text-gray-500">{variants?.length > 0 && <span>{variants?.length} {t("pos_menu.variants")}</span>} {addons?.length > 0 && <span>{addons?.length} {t("pos_menu.addons")}</span>}</p>
                    <button onClick={() => {
                      if (hasVariantOrAddon) {
                        btnOpenVariantAndAddonModal(id);
                      } else {
                        addItemToCart(menuItem);
                      }
                    }} className='rounded-lg px-6 py-1 transition active:scale-95 text-white flex items-center justify-center font-bold bg-restro-green hover:bg-restro-green-button-hover'>
                      {t("pos_menu.add")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="h-40"></div>
        </div>
      )}
    </div>
  );
};

export default POSMenuItemDetailedView;
