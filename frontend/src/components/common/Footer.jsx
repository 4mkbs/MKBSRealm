import React from "react";

const Footer = () => {
  const languages = [
    "English (UK)",
    "বাংলা",
    "हिन्दी",
    "Español",
    "Português",
    "العربية",
    "中文",
  ];

  const links = [
    "Sign Up",
    "Log in",
    "Messenger",
    "Video",
    "Places",
    "Games",
    "Marketplace",
    "Privacy Policy",
    "Terms",
    "Help",
  ];

  return (
    <footer className="bg-white py-5 text-[#606770] border-t border-gray-200">
      <div className="max-w-[980px] mx-auto px-4">
        <div className="flex flex-col mb-5">
          {/* Language Links */}
          <div className="flex flex-wrap gap-2 mb-3 text-xs">
            {languages.map((lang) => (
              <a key={lang} href="#" className="text-[#606770] hover:underline">
                {lang}
              </a>
            ))}
            <button className="text-[#606770] border border-gray-300 px-2 rounded hover:bg-gray-100">
              +
            </button>
          </div>
          <hr className="border-t border-[#dddfe2] mb-3" />
          {/* Info Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {links.map((link) => (
              <a key={link} href="#" className="text-[#606770] hover:underline">
                {link}
              </a>
            ))}
          </div>
        </div>
        <div className="text-xs text-[#606770]">
          <p>MKBS Realm © {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
