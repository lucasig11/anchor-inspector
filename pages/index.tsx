/** @jsxImportSource theme-ui */
import { Text } from "@theme-ui/components"
import Header from "@/components/Header/Header"
import { useIdl } from "@/hooks/idl"
import { Button, Select } from "theme-ui"
import { useCallback, useRef, useState } from "react"
import { Form } from "@unform/web"
import { FormHandles } from "@unform/core"
import { PublicKey } from "@solana/web3.js"
import Input from "@/components/Input"
import { IdlAccount, IdlAccountItem } from "@project-serum/anchor/dist/cjs/idl"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"

type AccountKey = `acc_${string}`
type ArgKey = `arg_${string}`

interface FormData {
  [key: AccountKey]: PublicKey
  [key: ArgKey]: string
}

export default function Home() {
  const formRef = useRef<FormHandles>(null)
  const { idl, load, program } = useIdl()
  const { connection } = useConnection()
  const wallet = useWallet()
  const [selectedIx, setSelectedIx] = useState(0)

  const handleLoadIdlFromClipboard = useCallback(() => {
    window.navigator.clipboard.readText().then((text) => {
      load(text)
    })
  }, [load])

  const flattenAccountItem = useCallback(
    (items: IdlAccountItem[]): IdlAccount[] => {
      return items
        .map((item) => {
          if ("accounts" in item) {
            return flattenAccountItem(item.accounts)
          } else {
            return item
          }
        })
        .flat()
    },
    []
  )

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        formRef.current?.setErrors({})
        const args = []
        const accounts = Object.entries(data).reduce((acc, [key, value]) => {
          if (key.startsWith("acc_")) {
            const newKey = key.replace("acc_", "")
            acc[newKey] = new PublicKey(value)
          }
          return acc
        }, {})

        const flattened = flattenAccountItem(
          idl.instructions[selectedIx].accounts
        )

        const ixName = idl.instructions[selectedIx].name
        const tx = await program.methods[ixName](...args)
          .accounts(accounts)
          .transaction()

        const { blockhash, lastValidBlockHeight } =
          await connection.getLatestBlockhash()
        tx.recentBlockhash = blockhash
        tx.feePayer = wallet.publicKey
        tx.lastValidBlockHeight = lastValidBlockHeight
        const signed = await wallet.signTransaction(tx)
        await wallet.sendTransaction(signed, connection)
      } catch (err) {
        console.log(err)
      }
    },
    [
      program?.methods,
      idl?.instructions,
      selectedIx,
      connection,
      flattenAccountItem,
      wallet,
    ]
  )

  return (
    <>
      <Header />
      <main
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          maxWidth: "64rem",
          margin: "0 auto",
          marginTop: "4rem",
          padding: "0 1.6rem",
        }}
      >
        <Text variant="heading">IDL Inspector</Text>
        <Button onClick={handleLoadIdlFromClipboard}>
          Load IDL from clipboard
        </Button>

        {idl && (
          <>
            <Select
              mt={"3rem"}
              value={selectedIx}
              onChange={(e) => setSelectedIx(Number(e.target.value))}
            >
              {idl.instructions.map((ix, ixIndex) => (
                <option key={ixIndex} value={ixIndex}>
                  {ix.name}
                </option>
              ))}
            </Select>
            <pre>{JSON.stringify(idl.instructions[selectedIx], null, 2)}</pre>
            <Form ref={formRef} onSubmit={handleSubmit}>
              {idl?.instructions[selectedIx]?.accounts?.map((arg) => (
                <Input
                  mb={2}
                  key={arg.name}
                  placeholder={arg.name}
                  name={`acc_${arg.name}`}
                />
              ))}
              <Button type="submit">Send instruction</Button>
            </Form>
          </>
        )}
      </main>
      <footer
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: "4rem 0",
        }}
      >
        Created by
        <a
          href="https://github.com/mentalabsio"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            marginLeft: "0.2em",
          }}
        >
          <Text
            variant="small"
            sx={{
              color: (theme) => theme.colors?.primary,
            }}
          >
            Menta Labs
          </Text>
        </a>{" "}
      </footer>
    </>
  )
}
