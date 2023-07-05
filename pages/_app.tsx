import "../styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "../components/Layout";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { BoardProvider } from "context";
import { ThemeProvider } from "next-themes";

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={client}>
      <ChakraProvider>
        <ThemeProvider attribute="class">
          <BoardProvider>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </BoardProvider>
        </ThemeProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
