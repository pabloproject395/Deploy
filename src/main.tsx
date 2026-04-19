import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@/lib/api-client";

// Gunakan VITE_API_URL jika di-set (untuk Vercel), 
// kalau tidak, pakai relative URL (untuk lokal)
if (import.meta.env.VITE_API_URL) {
  setBaseUrl(import.meta.env.VITE_API_URL as string);
}

createRoot(document.getElementById("root")!).render(<App />);
