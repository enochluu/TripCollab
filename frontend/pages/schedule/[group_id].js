import * as React from "react";
import { Component } from "react";
import Paper from "@material-ui/core/Paper";
import {
  Scheduler,
  DayView,
  Appointments,
  EditingState,
  DragDropProvider,
  AppointmentTooltip,
} from "@devexpress/dx-react-scheduler-material-ui";
import Schedule_Table from "../../components/Table";
import { useRouter, withRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/client";
import NextLink from "next/link";
import {
  Box,
  Grid,
  GridItem,
  Divider,
  Center,
  Badge,
  Heading,
  Flex,
  HStack,
} from "@chakra-ui/react";

import Layout from "../../components/Layout";
import { v4 as uuidv4 } from "uuid";
import { createStandaloneToast } from "@chakra-ui/react";

export default function Schedule({ raw_schedule, status }) {
  const [session, loading] = useSession();

  const toast = createStandaloneToast();

  const runErrorToast = (msg) =>
    toast({
      title: "An error occurred.",
      description: `${msg}`,
      status: "error",
      duration: 9000,
      isClosable: true,
      position: "top",
    });

  const runSuccessToast = (msg) =>
    toast({
      title: "Success!",
      description: `${msg}`,
      status: "success",
      duration: 9000,
      isClosable: true,
      position: "top",
    });

  const login = async () => {
    if (session.accessToken == null) {
      // not logged in
      session.accessToken = uuidv4();
      let postURL = "http://127.0.0.1:5000/login";
      let reqOptions = {
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
        let res = await fetch(postURL, reqOptions);
      } catch (err) {
        runErrorToast("Please try again");
      }
    }
  };

  login();
  const router = useRouter();
  const group_id = router.query.group_id;
  const date = group_id.slice(-10);
  return (
    <Layout>
      <HStack mb="1em">
        <Heading m={3} size="lg">
          Schedule
        </Heading>
        <Badge fontSize="lg">{date}</Badge>
      </HStack>

      <Schedule_Table session={session} id={group_id} raw_data={raw_schedule} />
    </Layout>
  );
}

Schedule.getInitialProps = async (ctx) => {
  const { query } = ctx;
  let raw_schedule = [];
  const response = await fetch(
    "http://127.0.0.1:5000/schedule/" + query.group_id
  );
  if (response.status >= 200 && response.status <= 299) {
    raw_schedule = await response.json();
  }

  return { raw_schedule: raw_schedule, status: response.status };
};
