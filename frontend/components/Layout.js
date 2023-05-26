import { Box, Badge } from "@chakra-ui/react";
import SideBar from "./SideBar";
import Head from "next/head";

const Layout = ({ children }) => {
  return (
    <>
      <SideBar />
      <Box pt="2em">
        <Box ml="18em" mr="3em">
          {children}
        </Box>
      </Box>
    </>
  );
};

export default Layout;
