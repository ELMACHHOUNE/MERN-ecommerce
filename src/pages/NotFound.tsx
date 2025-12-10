import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Flower2, Home } from "lucide-react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const { t } = useTranslation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [location.pathname, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-blush-pop-50 to-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blush-pop-200 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blush-pop-200 rounded-full blur-3xl" />
      </div>

      <div className="text-center relative z-10 px-4">
        <div className="mb-6 flex justify-center">
          <div className="h-24 w-24 bg-blush-pop-100 rounded-full flex items-center justify-center animate-bounce">
            <Flower2 className="h-12 w-12 text-blush-pop-600" />
          </div>
        </div>
        <h1 className="mb-4 text-6xl font-display font-bold text-blush-pop-950">
          {t("notFound.title", "404")}
        </h1>
        <p className="mb-2 text-2xl text-blush-pop-900 font-light">
          {t("notFound.subtitle", "Oops! Page not found")}
        </p>
        <p className="mb-8 text-blush-pop-700/60">
          {t("notFound.redirecting", {
            count: countdown,
            defaultValue: `Redirecting to home in ${countdown} seconds...`,
          })}
        </p>
        <Button
          onClick={() => navigate("/")}
          className="bg-blush-pop-600 hover:bg-blush-pop-700 text-white rounded-full px-8 h-12 gap-2 shadow-lg hover:shadow-blush-pop-200 transition-all cursor-pointer"
        >
          <Home className="h-4 w-4" />
          {t("notFound.button", "Return Home Now")}
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
