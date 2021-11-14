import React from 'react'

import { FiCopy, FiRefreshCcw } from 'react-icons/fi'

type detailProps = {
  label: string; 
  value: string; 
  hasCopy?: boolean; 
  width: string; 
  needsRefresh?: boolean; 
  onRefresh: () => void; 
}

const Detail = ({label, value, hasCopy, width, needsRefresh, onRefresh}: detailProps) => {
  return(
    <div className={`${width} mb-3`}> 
      <label className="quicksand text-sidewalk text-sm">{label}</label>
      <div className="flex flex-row items-center">
        <p className={`${label === 'Status' && 'capitalize'} truncate quicksand-semibold text-lg text-ink`}>{value}</p>
        {hasCopy && !needsRefresh &&
        <div className="ml-1 text-green cursor-pointer" onClick={() => {navigator.clipboard.writeText(value)}}>
          <FiCopy /> 
        </div> }
        {needsRefresh &&
        <div className="ml-1 text-green cursor-pointer" onClick={onRefresh}>
          <FiRefreshCcw /> 
        </div> }
      </div>
    </div> 
  )
}

export default Detail