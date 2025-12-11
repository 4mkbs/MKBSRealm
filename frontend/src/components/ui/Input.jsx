import React from "react";

const Input = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  className = "",
  error = false,
  ...props
}) => {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`
        w-full px-4 py-3 border rounded-lg text-base
        focus:outline-none focus:border-[#1877f2] focus:ring-2 focus:ring-[#1877f2]/20
        transition
        ${error ? "border-red-500" : "border-gray-300"}
        ${className}
      `}
      {...props}
    />
  );
};

export default Input;
