import React from "react";

import Select from "react-select";

type InputProps = {
  label?: string;
  placeholder?: string;
  icon?: React.ReactNode;
  currencyDropdown?: true;
  extraClass?: string;
  error?: string;
  type: string;
  id: string;
  name: string;
  onChange: () => void;
};

const options = [
  { value: "wei", label: "WEI" },
  { value: "gwei", label: "GWEI" },
  { value: "ether", label: "ETH" },
];

const InputField = ({
  label,
  placeholder,
  icon,
  currencyDropdown,
  extraClass,
  error,
  type,
  id,
  name,
  onChange,
}: InputProps) => {
  return (
    <>
      <div
        className={`verity-input w-full border-b border-line flex flex-row items-center px-1 pb-3 relative ${extraClass}`}
      >
        <div className="mr-5">{icon}</div>
        <div className="flex flex-row w-full items-center">
          <input
            type={type}
            id={id}
            name={name}
            step={type === "number" ? "0.01" : undefined}
            className="quicksand-medium text-ink"
            onChange={onChange}
            required
          />
          <div className="quicksand-medium label absolute" style={currencyDropdown && { top: "5px" }}>
            {label}
          </div>
        </div>
        {currencyDropdown && (
          <div className="text-ink quicksand-semibold text-lg" style={{ width: "130px" }}>
            <Select
              options={options}
              defaultValue={{ value: "wei", label: "WEI" }}
              classNamePrefix="conversion"
              name="unit"
            />
          </div>
        )}
      </div>
      {error && <span className="text-error quicksand-medium text-sm">{error}</span>}
    </>
  );
};

export default InputField;
