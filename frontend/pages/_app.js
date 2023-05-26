// import theme from '../styles/theme'
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { Provider } from "next-auth/client";
import NProgress from "nprogress";
import Router from "next/router";
import Head from "next/head";

Router.onRouteChangeStart = (url) => {
  // console.log(url);
  NProgress.start();
};
Router.onRouteChangeComplete = () => NProgress.done();
Router.onRouteChangeError = () => NProgress.done();

function MyApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <Head>
        <title>Trip Collab</title>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css"
          integrity="sha512-42kB9yDlYiCEfx2xVwq0q7hT4uf26FUgSIZBK8uiaEnTdShXjwr8Ip1V4xGJMg3mHkUt9nNuTDxunHF0/EgxLQ=="
          crossorigin="anonymous"
        />
      </Head>
      <ChakraProvider>
        <Component {...pageProps} />
        <script
          async
          src="https://maps.googleapis.com/maps/api/js?key=AIzaSyBqH3tJVTFy2V7ReFjVevGqphXdTQNUWJA&libraries=places"
        ></script>
      </ChakraProvider>
    </Provider>
  );
}
export default MyApp;
