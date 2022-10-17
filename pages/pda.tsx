/** @jsxImportSource theme-ui */
import { useCallback, useRef, useState } from "react"
import { v4 as uuid } from "uuid"
import { FiCopy, FiSave } from "react-icons/fi"
import { Button, Checkbox, Close, Flex, Label } from "theme-ui"
import { Text } from "@theme-ui/components"
import { PublicKey } from "@solana/web3.js"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"
import { FormHandles } from "@unform/core"

import Header from "@/components/Header/Header"
import { useAddressStorage } from "@/hooks/addressStorage"
import Input from "@/components/Input"
import { Form } from "@unform/web"
import parseSeed from "utils/parseSeeds"

interface PDA {
  address: PublicKey
  bump: number
}

type SeedIndex = `seed_${string}`
interface GeneratePdaData {
  programId: string
  [k: SeedIndex]: string
}

export default function PdaGenerator() {
  const { add } = useAddressStorage()
  const formRef = useRef<FormHandles>(null)
  const [pda, setPda] = useState<PDA | null>(null)
  const [seeds, setSeeds] = useState<string[]>([])
  const [showBump, setShowBump] = useState<boolean>(false)

  const handleSubmit = useCallback((data: GeneratePdaData) => {
    try {
      formRef.current?.setErrors({})

      const programId = new PublicKey(data.programId)
      const seeds = Object.entries(data)
        .filter(([s]) => s.includes("seed"))
        .map(([_, v]) => parseSeed(v))

      const [address, bump] = findProgramAddressSync(
        seeds.map((s) => s.data),
        programId
      )

      setPda({ address, bump })
    } catch (err) {
      console.log(err)
    }
  }, [])

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
        <Text mb={4} variant="headingSpecial">
          Derive program address
        </Text>

        {pda && (
          <Flex
            sx={{
              width: "100%",
              alignItems: "center",
              justifyContent: "space-around",
              marginBottom: "2rem",
            }}
          >
            <Text
              variant="secondary"
              sx={{
                background: "rgba(80, 80, 80, 0.2)",
                padding: "1rem",
                borderRadius: "10px",
              }}
            >
              Address: {pda.address.toBase58()}
              <br />
              {showBump && <Text>Bump: {pda.bump}</Text>}
            </Text>
            <FiCopy
              size={20}
              onClick={() =>
                navigator.clipboard.writeText(pda.address.toBase58())
              }
              sx={{
                "&:hover": {
                  cursor: "pointer",
                  color: "primary",
                },
              }}
            />
            <FiSave
              size={20}
              onClick={() => add(pda.address, pda.address.toBase58())}
              sx={{
                "&:hover": {
                  cursor: "pointer",
                  color: "primary",
                },
              }}
            />
          </Flex>
        )}

        <Form ref={formRef} onSubmit={handleSubmit}>
          <Input mb={2} placeholder="Program ID" name="programId" />

          {seeds.map((id) => (
            <Flex
              key={id}
              sx={{
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Input placeholder="Seed" name={`seed_${id}`} my={1} pr={4} />
              <Close
                p={0}
                m={0.2}
                sx={{
                  position: "absolute",
                  "&:hover": {
                    cursor: "pointer",
                    color: "primary",
                  },
                }}
                onClick={() => setSeeds(seeds.filter((s) => s !== id))}
              />
            </Flex>
          ))}

          <Flex>
            <Button
              m={3}
              variant="secondary"
              onClick={() => setSeeds([...seeds, uuid()])}
            >
              Add new seed
            </Button>

            <Button type="submit" variant="secondary" m={3}>
              Generate address
            </Button>
          </Flex>
        </Form>

        {pda && (
          <Label>
            <Checkbox
              onChange={() => setShowBump(!showBump)}
              checked={showBump}
            />
            Show bump
          </Label>
        )}
      </main>
    </>
  )
}
