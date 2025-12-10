import { Facebook, Instagram, MessageCircle } from "lucide-react";

export const SocialSidebar = () => {
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      url: "https://wa.me/",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left Center) */}
      <div className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 flex-col gap-3 pl-1">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center justify-center w-10 h-10 
              bg-white/90 backdrop-blur-sm 
              border border-blush-pop-200 
              text-blush-pop-700 
              shadow-sm hover:shadow-md 
              rounded-r-xl rounded-l-md
              transition-all duration-300 
              hover:w-12 hover:bg-blush-pop-50 hover:text-blush-pop-900
              group
            "
            aria-label={link.name}
          >
            <link.icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
          </a>
        ))}
      </div>

      {/* Mobile Bottom Bar (Fixed Bottom Center) */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 px-8 py-3 bg-white/90 backdrop-blur-md border border-blush-pop-200 rounded-full shadow-xl shadow-blush-pop-100/50">
        {socialLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blush-pop-600 hover:text-blush-pop-900 hover:scale-125 transition-all duration-300"
            aria-label={link.name}
          >
            <link.icon className="w-6 h-6" />
          </a>
        ))}
      </div>
    </>
  );
};
