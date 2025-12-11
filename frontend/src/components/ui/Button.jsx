import React from "react";

const variants = {
  primary: "bg-[#1877f2] text-white hover:bg-[#165ec1]",
  secondary: "bg-gray-200 text-gray-700 hover:bg-gray-300",
  success: "bg-[#42b72a] text-white hover:bg-[#36a420]",
  danger: "bg-red-500 text-white hover:bg-red-600",
  ghost: "bg-transparent text-[#1877f2] hover:bg-gray-100",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-6 py-3 text-lg",
  xl: "px-8 py-4 text-xl",
};

const Button = ({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
  type = "button",
  onClick,
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        font-semibold rounded-lg transition cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
