import { useState, useEffect } from "react";
import {
  Box,
  Center,
  Flex,
  Text,
  Heading,
  Spacer,
  Divider,
  Button,
  Progress,
} from "@chakra-ui/react";
import { GiSchoolBag } from "react-icons/gi";
import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/client";
import Link from "next/link";
import { CollectionsBookmarkRounded } from "@material-ui/icons";
import { v4 as uuidv4 } from "uuid";

export default function Home() {
  const [session, loading] = useSession();
  useEffect(async () => {
    if (session != null) {
      const accessToken = uuidv4();
      session.accessToken = accessToken;
      const postURL = "http://127.0.0.1:5000/login";
      const reqOptions = {
        body: JSON.stringify({
          token: session.accessToken,
          email: session.user.email,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      };
      try {
        const res = await fetch(postURL, reqOptions);
        const response = await res;
      } catch (err) {
        console.log(err);
      }
    }
  }, [session]);

  return (
    <>
      <Center>
        <Flex
          bgGradient="linear(to-l, #42C0B1, #299689)"
          mt="12em"
          width="60%"
          height="25em"
          color="white"
          alignItems="center"
          justifyContent="center"
          borderRadius="5em"
        >
          <GiSchoolBag size={230} />
          <Flex flexDirection="column">
            <Heading fontSize="9xl">Trip Collab</Heading>
            <Text fontSize="3xl" ml="0.5rem">
              Decide and Plan Together
            </Text>
            {!session ? (
              <Button
                colorScheme="whiteAlpha"
                width="7em"
                borderRadius="1em"
                mt="1em"
                onClick={() => signIn()}
              >
                Login
              </Button>
            ) : (
              <Link href="create-group">
                <Button color="white" width="10em" borderRadius="1em" mt="1em">
                  <Text color="teal.500">Start Now »</Text>
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
      </Center>
      <Center>
        <Progress mt="5em" size="xs" width="60%" />
        {/* <Divider mt="5em" width="60%" /> */}
      </Center>
    </>
  );
}
