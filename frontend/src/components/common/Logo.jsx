import React from "react";
import { Link } from "react-router-dom";

const sizes = {
  sm: "text-2xl",
  md: "text-3xl",
  lg: "text-4xl",
  xl: "text-5xl",
  "2xl": "text-6xl",
};

const Logo = ({ size = "md", asLink = true, className = "" }) => {
  const logoContent = (
    <span className={`font-bold text-[#1877f2] ${sizes[size]} ${className}`}>
      MKBS Realm
    </span>
  );

  if (asLink) {
    return <Link to="/">{logoContent}</Link>;
  }

  return logoContent;
};

export default Logo;
