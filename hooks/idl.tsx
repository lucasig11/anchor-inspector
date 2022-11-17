import { AnchorProvider, Idl, Program } from "@project-serum/anchor"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import React, {
  useContext,
  createContext,
  useState,
  useCallback,
  useMemo,
} from "react"

interface IdlContextData {
  idl: Idl
  program: Program
  load(json: string): Promise<void>
}

const IdlContext = createContext<IdlContextData>({} as IdlContextData)

interface Props {
  children: React.ReactNode
}

export const IdlProvider: React.FC<Props> = ({ children }) => {
  const { connection } = useConnection()
  const { publicKey, signTransaction, signAllTransactions } = useWallet()
  const [idl, setIdl] = useState<Idl | null>(null)

  const program = useMemo(() => {
    if (!idl) return
    const provider = new AnchorProvider(
      connection,
      { publicKey, signTransaction, signAllTransactions },
      {}
    )
    return new Program(idl, idl?.metadata?.address, provider)
  }, [idl, connection, publicKey, signTransaction, signAllTransactions])

  const load = useCallback(async (json: string) => {
    const idl = JSON.parse(json) as Idl
    setIdl(idl)
  }, [])

  return (
    <IdlContext.Provider value={{ idl, load, program }}>
      {children}
    </IdlContext.Provider>
  )
}

export function useIdl(): IdlContextData {
  const context = useContext(IdlContext)

  if (!context) throw new Error("useIdl must be used within an IdlProvider")

  return context
}
