import { PublicKey } from "@solana/web3.js"
import React, { useContext, useState, createContext, useCallback } from "react"

interface Address {
  id: string
  k: PublicKey
}
interface StorageContextData {
  readonly addresses: Address[]
  add(p: PublicKey, id: string): void
  remove(id: string): void
}

const StorageContext = createContext<StorageContextData>(
  {} as StorageContextData
)

interface Props {
  children: React.ReactNode
}

export const AddressStorageProvider: React.FC<Props> = ({ children }) => {
  const [data, setData] = useState<Address[]>(() => {
    const keys = localStorage.getItem("@AnchorInspector:Addresses")
    if (keys) return JSON.parse(keys)
    return [] as Address[]
  })

  const add = useCallback(
    (k: PublicKey, id?: string) => {
      const e = data.find((e) => e.id === id)
      if (e) {
        e.k = k
      } else {
        data.push({ k, id: id || k.toBase58() })
      }
      setData(data)
      console.log(data)
      localStorage.setItem("@AnchorInspector:Addresses", JSON.stringify(data))
    },
    [data]
  )

  const remove = useCallback(
    (id: string) => {
      setData(data.filter((d) => d.id !== id))
      localStorage.setItem("@AnchorInspector:Addresses", JSON.stringify(data))
    },
    [data]
  )

  return (
    <StorageContext.Provider value={{ addresses: data, add, remove }}>
      {children}
    </StorageContext.Provider>
  )
}

export function useAddressStorage(): StorageContextData {
  const context = useContext(StorageContext)

  if (!context)
    throw new Error(
      "useAddressStorage must be used within an AddressStorageProvider"
    )

  return context
}
