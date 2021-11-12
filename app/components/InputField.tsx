import React from 'react'

type InputProps = {
  label?: string; 
  placeholder?: string; 
  icon?: React.ReactNode; 
  suffix?: string; 
  extraClass?: string; 
  error?: string; 
  type: string; 
  id: string; 
  name: string; 
  onChange: () => void; 
}

const InputField = ({label, placeholder, icon, suffix, extraClass, error, type, id, name, onChange}: InputProps) => {
  return (
    <>
    <div className={`verity-input w-full border-b border-line flex flex-row items-center px-1 pb-3 relative ${extraClass}`}>
      <div className="mr-5">
        {icon}
      </div>
      <div className="flex flex-row w-full">
        <input type={type} id={id} name={name} className="quicksand-medium text-ink" onChange={onChange} required/> 
        <div className="quicksand-medium label absolute">{label}</div>
      </div> 
      <div className="text-ink quicksand-semibold text-lg">
        {suffix}
      </div>
    </div>
    {error && <span className="text-error quicksand-medium text-sm">{error}</span>}
    </>
  )
}

export default InputField 