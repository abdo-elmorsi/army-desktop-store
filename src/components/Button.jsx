import React from "react";
import classNames from "classnames";

const Button = ({ className = "btn--primary", type = "button", children, disabled=false, ...rest }) => {
  const boxClasses = classNames(
    `btn`,
    className
  );
  return (
    <button
      className={boxClasses}
      type={type}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
};



export default Button;