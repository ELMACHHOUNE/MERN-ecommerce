import { useTranslation } from "react-i18next";
import { Heart, Star, Award, Phone } from "lucide-react";
import { Link } from "react-router-dom";

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      {/* Main Content Container with Background Image */}
      <div className="relative w-full max-w-7xl rounded-4xl overflow-hidden shadow-2xl">
        <img
          src="/cover2.webp"
          alt="Background"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />

        {/* Light Overlay to match floral theme */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px]" />

        {/* Content Wrapper */}
        <div className="relative z-10 p-8 md:p-16 text-center space-y-12">
          {/* Header */}
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h1 className="text-4xl md:text-6xl font-bold font-display drop-shadow-sm text-primary">
              {t("about.title")}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              {t("about.subtitle")}
            </p>
            <div className="h-1 w-24 bg-primary mx-auto rounded-full mt-6" />
          </div>

          {/* Story */}
          <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
            <h2 className="text-2xl font-bold font-display text-foreground">
              {t("about.story.title")}
            </h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {t("about.story.desc")}
            </p>
          </div>

          {/* Values Grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-4">
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 bg-blush-pop-100/90 backdrop-blur-md p-6 rounded-2xl border border-blush-pop-200 hover:bg-blush-pop-200/90 transition-colors shadow-sm">
              <div className="w-12 h-12 mx-auto bg-white/60 rounded-full flex items-center justify-center text-primary mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-blush-pop-900">
                {t("about.values.quality")}
              </h3>
              <p className="text-sm text-blush-pop-800">
                {t("about.values.quality.desc")}
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 delay-100 bg-blush-pop-100/90 backdrop-blur-md p-6 rounded-2xl border border-blush-pop-200 hover:bg-blush-pop-200/90 transition-colors shadow-sm">
              <div className="w-12 h-12 mx-auto bg-white/60 rounded-full flex items-center justify-center text-primary mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-blush-pop-900">
                {t("about.values.art")}
              </h3>
              <p className="text-sm text-blush-pop-800">
                {t("about.values.art.desc")}
              </p>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 delay-200 bg-blush-pop-100/90 backdrop-blur-md p-6 rounded-2xl border border-blush-pop-200 hover:bg-blush-pop-200/90 transition-colors shadow-sm">
              <div className="w-12 h-12 mx-auto bg-white/60 rounded-full flex items-center justify-center text-primary mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-blush-pop-900">
                {t("about.values.passion")}
              </h3>
              <p className="text-sm text-blush-pop-800">
                {t("about.values.passion.desc")}
              </p>
            </div>
          </div>

          {/* Contact */}
          <div className="pt-8 border-t border-primary/20 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
            <h2 className="text-2xl font-bold mb-4 font-display text-primary">
              {t("about.contact.title")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("about.contact.desc")}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-3 text-xl font-bold bg-primary text-primary-foreground px-8 py-4 rounded-full hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Phone className="w-6 h-6" />
              <span>0659444784</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
