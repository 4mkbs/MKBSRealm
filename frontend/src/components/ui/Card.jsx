import React from "react";

const Card = ({ children, className = "", ...props }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
