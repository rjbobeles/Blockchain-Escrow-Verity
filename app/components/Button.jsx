import React from "react";

import { CircularLoading } from "respinner";

const Button = ({
  label,
  onClick,
  appearance,
  barShadow,
  showSpinner,
  type,
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      className={`w-full verity-button relative flex items-center justify-center ${
        appearance === "solid"
          ? "bg-green verity-button--solid text-white"
          : "verity-button--outline border border-green text-green"
      } ${barShadow && "shadow-glow"}`}
    >
      <span className={`quicksand-medium ${showSpinner && "opacity-0"}`}>
        {label}
      </span>
      {showSpinner && <CircularLoading size={20} className="button-spinner" />}
    </button>
  );
};

export default Button;
