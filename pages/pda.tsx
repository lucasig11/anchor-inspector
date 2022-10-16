/** @jsxImportSource theme-ui */
import { Text } from "@theme-ui/components"
import Header from "@/components/Header/Header"
import { useCallback, useEffect, useState } from "react"
import { v4 as uuid } from "uuid"
import {
  Button,
  Checkbox,
  Close,
  CloseIcon,
  Flex,
  IconButton,
  Input,
  Label,
} from "theme-ui"
import { PublicKey } from "@solana/web3.js"
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey"

type SeedKind = "pubkey" | "string"
type Seed = {
  id: string
  raw: Buffer
  kind: SeedKind
}

type PDA = {
  address: PublicKey
  bump: number
}

export default function PdaGenerator() {
  const [programId, setProgramId] = useState<PublicKey | null>(null)
  const [pda, setPda] = useState<PDA | null>(null)
  const [seeds, setSeeds] = useState<Seed[]>([])
  const [showBump, setShowBump] = useState<boolean>(false)

  const handleChangeSeed = useCallback(
    (id: string, value: string) => {
      const seed = seeds.find((s) => s.id === id)
      if (!seed) return
      try {
        const p = new PublicKey(value)
        seed.raw = p.toBuffer()
        seed.kind = "pubkey"
        // TODO: convert to JSON values (number/BN, array, objects etc.)
      } catch {
        seed.raw = Buffer.from(value)
        seed.kind = "string"
      }
      setSeeds(seeds)
    },
    [seeds]
  )

  const handleChangeProgramId = useCallback((value: string) => {
    try {
      const pk = new PublicKey(value)
      setProgramId(pk)
    } catch {}
  }, [])

  const handleGenerateAddress = useCallback(() => {
    const seedsRaw = seeds.map(({ raw }) => raw)
    if (!programId) {
      // setError("Invalid program ID.")
      return
    }
    const [address, bump] = findProgramAddressSync(seedsRaw, programId)
    setPda({ address, bump })
  }, [seeds, programId])

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
              flexDirection: "column",
              marginBottom: "2rem",
            }}
          >
            <Text
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(pda.address.toBase58())
                // setToast("Copied!")
              }}
              sx={{
                background: "rgba(80, 80, 80, 0.2)",
                padding: "1rem",
                borderRadius: "10px",
                "&:hover": {
                  cursor: "pointer",
                  color: "primary",
                  background: "rgba(80, 80, 80, 0.4)",
                },
              }}
            >
              Address: {pda.address.toBase58()}
              <br />
              {showBump && <Text>Bump: {pda.bump}</Text>}
            </Text>
          </Flex>
        )}

        <Input
          placeholder="Program ID"
          onChange={(e) => handleChangeProgramId(e.target.value)}
          sx={{
            margin: "1rem",
          }}
        />

        {seeds.map(({ id }) => (
          <Flex
            key={id}
            sx={{
              alignItems: "center",
              justifyContent: "flex-end",
              width: "100%",
            }}
          >
            <Input
              placeholder="Seed"
              onChange={(e) => handleChangeSeed(id, e.target.value)}
              sx={{
                marginY: "1rem",
                paddingRight: "3.7rem",
              }}
            />
            <Close
              sx={{
                padding: 0,
                margin: ".2rem",
                position: "absolute",
                "&:hover": {
                  cursor: "pointer",
                  color: "primary",
                },
              }}
              onClick={() => setSeeds(seeds.filter((s) => s.id !== id))}
            />
          </Flex>
        ))}

        <Flex>
          <Button
            variant="secondary"
            sx={{ margin: "3rem" }}
            onClick={() => {
              setSeeds([
                ...seeds,
                { id: uuid(), raw: Buffer.from(""), kind: "string" },
              ])
            }}
          >
            Add new seed
          </Button>
          <Button
            variant="secondary"
            sx={{ margin: "3rem" }}
            onClick={() => handleGenerateAddress()}
          >
            Generate address
          </Button>
        </Flex>
        <Label>
          <Checkbox
            onChange={() => setShowBump(!showBump)}
            checked={showBump}
          />
          Show bump
        </Label>
      </main>
    </>
  )
}
