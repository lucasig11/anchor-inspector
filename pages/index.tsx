/** @jsxImportSource theme-ui */
import { Text } from "@theme-ui/components"
import Header from "@/components/Header/Header"

export default function Home() {
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
      ></main>
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
        </a>
      </footer>
    </>
  )
}
