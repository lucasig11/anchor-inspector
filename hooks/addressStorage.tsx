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
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const keys = localStorage.getItem("@AnchorInspector:Addresses")
    if (keys) return JSON.parse(keys)
    return [] as Address[]
  })

  const add = useCallback(
    (k: PublicKey, id?: string) => {
      const newAddrs = addresses.filter((e) => e.id !== id)
      newAddrs.push({ k, id: id || k.toBase58() })

      localStorage.setItem(
        "@AnchorInspector:Addresses",
        JSON.stringify(newAddrs)
      )

      setAddresses(newAddrs)
    },
    [addresses]
  )

  const remove = useCallback(
    (id: string) => {
      const data = addresses.filter((a) => a.id !== id)
      localStorage.setItem("@AnchorInspector:Addresses", JSON.stringify(data))
      setAddresses(data)
    },
    [addresses]
  )

  return (
    <StorageContext.Provider value={{ addresses, add, remove }}>
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
