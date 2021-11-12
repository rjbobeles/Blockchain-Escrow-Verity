import React from 'react'

import { FiCopy } from 'react-icons/fi'

type detailProps = {
  label: string; 
  value: string; 
  hasCopy?: boolean; 
  width: string; 
}

const Detail = ({label, value, hasCopy, width}: detailProps) => {
  return(
    <div className={`${width} mb-3`}> 
      <label className="quicksand text-sidewalk text-sm">{label}</label>
      <div className="flex flex-row items-center">
        <p className={`${label === 'Status' && 'capitalize'} truncate quicksand-semibold text-lg text-ink`}>{value}</p>
        {hasCopy && 
        <div className="ml-1 text-green cursor-pointer" onClick={() => {navigator.clipboard.writeText(value)}}>
          <FiCopy /> 
        </div> }
      </div>
    </div> 
  )
}

export default Detail