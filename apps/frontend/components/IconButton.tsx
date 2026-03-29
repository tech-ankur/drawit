import React, { ReactNode } from 'react'

interface iconprop{
    icon:ReactNode,
    onClick:()=>void,
    activated:boolean
}
const IconButton = ({icon,onClick,activated}:iconprop) => {
  return (
    <div
      className={`cursor-pointer rounded-full border p-2 bg-black transition-colors ${
        activated
          ? "bg-white text-black"
          : "text-white hover:bg-gray-500 hover:text-black"
      }`}
      onClick={onClick}
    >
      {icon}
    </div>
  )
}

export default IconButton