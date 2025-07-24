import React from "react";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { iconStroke } from "../config/config";
import { useTheme } from "../contexts/ThemeContext";
export default function Popover({text}) {
  const { theme } = useTheme();
  return (
    <div className={`relative ${theme === "black" ? " text-white" : "text-gray-700"}`}>
      <IconInfoCircleFilled
        size={18}
        className="text-gray-400 peer cursor-pointer"
        stroke={iconStroke}
      />
      <p className={`z-50 hidden text-sm transition peer-hover:block absolute -translate-y-1/2 top-1/2 left-8 w-96 rounded-lg shadow-lg p-2 ${theme === "black" ? " text-white bg-[#353535]" : "text-gray-500 bg-white "}`}>
        {text}
      </p>
    </div>
  );
}
