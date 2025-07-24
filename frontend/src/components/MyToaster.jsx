import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "../contexts/ThemeContext";
export default function MyToaster() {
    const {theme} = useTheme();
  return (
    <Toaster
      toastOptions={{
        style: {
          background: theme === "black" ? "#1a1a1a" : "#ffffff",
          color: theme === "black" ? "#f5f5f5" : "#000000",
        },
      }}
    />
  );
}
