import React from "react";
// import { SidebarData } from "./SidebarData";
import { GiSchoolBag } from "react-icons/gi";
import {
  Box,
  Heading,
  Center,
  Button,
  Text,
  Flex,
  Spacer,
  HStack,
  Img,
  Avatar,
  Stack,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { AiFillCompass } from "react-icons/ai";
import { BsBarChartFill } from "react-icons/bs";
import { AiFillCalendar } from "react-icons/ai";
import { FaCookieBite } from "react-icons/fa";
import Link from "next/link";
import { useSession } from "next-auth/client";

const styles = {
  sideBar: {
    minHeight: "100vh",
    height: "105%",
    width: "250px",
    background: "linear-gradient(183.27deg, #38B2AC 0%, #2C7A7B 100.28%)",
    position: "absolute",
  },

  sidebarList: {
    height: "auto",
    width: "100%",
  },

  row: {
    width: "100%",
    height: "60px",
    display: "flex",
    flexDirection: "row",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  icon: {
    flex: "30%",
    display: "grid",
    placeItems: "center",
  },

  title: {
    flex: "70%",
  },

  icon1: {
    flex: "30%",
    display: "grid",
    placeItems: "center",
    marginTop: "2em",
  },
  row1: {
    width: "100%",
    height: "60px",
    display: "flex",
    flexDirection: "row",
    color: "white",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "20pt",
    marginBottom: "1em",
    fontWeight: "bolder",
  },
};

function SideBar() {
  const router = useRouter();
  const group_id = router.query["group_id"];
  const [session, loading] = useSession();
  const SidebarData = [
    {
      title: "Nominations",
      icon: <AiFillCompass color="white" size={25} />,
      link: `/activities/${group_id}`,
    },
    {
      title: "Poll Count",
      icon: <BsBarChartFill color="white" size={25} />,
      link: `/poll/${group_id}`,
    },
    {
      title: "Schedule",
      icon: <AiFillCalendar color="white" size={25} />,
      link: `/schedule/${group_id}`,
    },
    {
      title: "Side Activities",
      icon: <FaCookieBite color="white" size={25} />,
      link: `/side-activities/${group_id}`,
    },
  ];

  return (
    <>
      <div style={styles.sideBar}>
        <ul style={styles.sidebarList}>
          <Link href="/">
            <div style={styles.icon1}>
              <GiSchoolBag color="white" size={60} />
            </div>
          </Link>

          <div style={styles.row1}>Trip Collab</div>
          {SidebarData.map((val, key) => {
            return (
              <Link href={val.link} as={val.link}>
                <li style={styles.row} key={key}>
                  <Box
                    colorScheme="#008080"
                    width="20em"
                    height="3em"
                    _hover={{
                      background: "#004d4d",
                      width: "230px",
                    }}
                    cursor="pointer"
                  >
                    <HStack spacing="30px" mt="0.5em">
                      <Box ml="2em">{val.icon}</Box>
                      <Box m="40em" mb="1em">
                        {val.title}
                      </Box>
                    </HStack>
                  </Box>
                </li>
              </Link>
            );
          })}
          <Spacer />
          {session && (
            <Flex alignItems="center" flexDirection="column" mt="24em">
              <Avatar size="lg" src={session.user.image} />
              <Text fontSize="md" color="white" mt="0.5em">
                {session.user.name}
              </Text>
            </Flex>
          )}
        </ul>
      </div>
    </>
  );
}

export default SideBar;
