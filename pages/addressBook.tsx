/** @jsxImportSource theme-ui */
import { Button, Flex, Input, Text } from "@theme-ui/components"
import Header from "@/components/Header/Header"
import { useAddressStorage } from "@/hooks/addressStorage"
import { FiCopy, FiEdit, FiPlus, FiSave, FiTrash } from "react-icons/fi"
import { useCallback, useState } from "react"
import { PublicKey } from "@solana/web3.js"

export default function AddressBook() {
  const { addresses, add, remove } = useAddressStorage()
  const [newAddress, setNewAddress] = useState<string>("")
  const [identifier, setIdentifier] = useState<string>("")

  const handleAddAddress = useCallback(() => {
    try {
      const address = new PublicKey(newAddress)
      add(address, identifier)
      setNewAddress("")
      setIdentifier("")
    } catch (err) {
      console.log(err)
    }
  }, [add, identifier, newAddress])

  const handleEditAddress = useCallback(
    (address: string, id: string) => {
      remove(id)
      setNewAddress(address)
      setIdentifier(address === id ? "" : id)
    },
    [remove]
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
        <Text variant="heading">Address book</Text>

        <Flex
          m={4}
          sx={{
            width: "100%",
            justifyContent: "space-between",
          }}
        >
          <Input
            m={2}
            placeholder="Identifier (optional)"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          <Input
            m={2}
            placeholder="Address"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <Button m={2} py={0} variant="secondary" onClick={handleAddAddress}>
            <FiPlus
              sx={{ padding: 0, margin: 0 }}
              size={42}
              color="secondary"
            />
          </Button>
        </Flex>

        {addresses?.map(({ id, k }) => (
          <Flex
            key={id}
            sx={{
              margin: "1rem",
              padding: "1rem",
              paddingRight: "2rem",
              borderRadius: "10px",
              width: "48rem",
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              alignItems: "center",
              justifyContent: "space-between",
              transition: "width .5s",

              "&:hover": {
                width: "60rem",
                "& div": {
                  opacity: 100,
                },
                "#id": {
                  opacity: 0,
                },
                "#addr": {
                  opacity: 100,
                },
              },
            }}
          >
            <Text
              id="id"
              variant="heading4"
              sx={{
                transition: "opacity 0.7s",
              }}
            >
              {id}{" "}
              {k.toString() !== id && (
                <Text variant="small">
                  ({k.toString().slice(0, 4)}...
                  {k.toString().slice(k.toString().length - 4)})
                </Text>
              )}
            </Text>
            <Text
              id="addr"
              variant="heading4"
              sx={{
                position: "absolute",
                opacity: 0,
                transition: "opacity 0.5s",
              }}
            >
              {k.toString()}
            </Text>
            <Flex
              sx={{
                opacity: 0,
                transition: "opacity .4s",
                justifyContent: "space-evenly",
                width: "12rem",

                "& svg": {
                  "&:hover": {
                    cursor: "pointer",
                  },
                },
              }}
            >
              <FiEdit onClick={() => handleEditAddress(k.toString(), id)} />
              <FiCopy
                onClick={() => navigator.clipboard.writeText(k.toString())}
              />
              <FiTrash onClick={() => remove(id)} />
            </Flex>
          </Flex>
        ))}
      </main>
    </>
  )
}
