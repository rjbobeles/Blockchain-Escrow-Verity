import React from "react";

import { FiCopy } from "react-icons/fi";
import { CircularLoading } from "respinner";

const Detail = ({ label, value, hasCopy, width, spinner, onRefresh }) => {
  return (
    <div className={`${width} mb-3`}>
      <label className="quicksand text-sidewalk text-sm">{label}</label>
      <div className="flex flex-row items-center">
        <p
          className={`${
            label === "Status" && "capitalize"
          } truncate quicksand-semibold text-lg text-ink`}
        >
          {value}
        </p>
        {hasCopy && !spinner && (
          <div
            className="ml-1 text-green cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(value);
            }}
          >
            <FiCopy />
          </div>
        )}
        {spinner && (
          <div className="ml-2 text-green">
            <CircularLoading size={14} className="detail-spinner" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Detail;
