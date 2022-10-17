import { PublicKey } from "@solana/web3.js"
import { BN } from "bn.js"

type SeedKind = "string" | "pubkey" | "bytes" | "number"

interface Seed {
  kind: SeedKind
  data: Buffer
}

const parseSeed = (s: string): Seed => {
  if (s.startsWith("[")) {
    const asBytes = tryParse(s).as.bytes()
    if (asBytes)
      return {
        kind: "bytes",
        data: asBytes,
      }
  }

  const asPubkey = tryParse(s).as.pubkey()
  if (asPubkey) {
    return {
      kind: "pubkey",
      data: asPubkey,
    }
  }

  if (Number(s[0])) {
    const asInt = tryParse(s).as.int()
    if (asInt)
      return {
        kind: "number",
        data: asInt,
      }
  }

  return {
    kind: "string",
    data: Buffer.from(s),
  }
}

const tryParse = (
  data: string
): { as: { [f: string]: () => Buffer | null } } => {
  const bytes = (): Buffer => {
    const array = JSON.parse(data) as number[]
    if (!array) return null
    return Buffer.from(array)
  }

  const pubkey = (): Buffer => {
    try {
      return new PublicKey(data).toBuffer()
    } catch {}
    return null
  }

  const int = (): Buffer => {
    try {
      return new BN(data).toArrayLike(Buffer, "le")
    } catch {
      return null
    }
  }

  return { as: { bytes, pubkey, int } }
}
export default parseSeed
