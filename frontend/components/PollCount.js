import react from "react";
import { Box, Progress, Heading, Center, Flex, Spacer } from "@chakra-ui/react";
import { FaCalendarPlus } from "react-icons/fa";
import { useRouter } from "next/router";
import { useSession, signIn } from "next-auth/client";
import { createStandaloneToast } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";
import { long } from "webidl-conversions";

function PollCount(props) {
  var color = "green";
  function progressColor() {
    if (props.votecount == 0) {
      color = "none";
      return color;
    }
    if (props.votecount <= props.activeuser / 3) {
      color = "red";
      return color;
    }
    if (props.votecount <= (props.activeuser * 2) / 3) {
      color = "orange";
      return color;
    }
    return color;
  }
  const toast = createStandaloneToast();
  const runToast = (msg) =>
    toast({
      title: "An error occurred.",
      description: `${msg}`,
      status: "error",
      duration: 9000,
      isClosable: true,
      position: "top",
    });

  const router = useRouter();
  const [session, loading] = useSession();
  const login = async () => {
    if (session == null) {
      signIn();
    } else if (session.accessToken == null) {
      session.accessToken = uuidv4();
    }
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
      console.log(err);
      runToast("Please try again");
    }
  };

  const addToSchedule = async () => {
    login();

    let postURL = `http://127.0.0.1:5000/schedule`;
    let reqOptions = {
      body: JSON.stringify({
        group_id: router.query.group_id,
        token: session.accessToken,
        activity_id: props.activity_id,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    };
    try {
      const res1 = await fetch(postURL, reqOptions);
      if (res1.status === 200) {
        // console.log(res1.status);
        toast({
          title: "Activity added to schedule",
          description: "See schedule to plan your trip.",
          status: "success",
          duration: 9000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Activity was not added to schedule",
        description:
          "You must be the group owner to add to an activity to the schedule.",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
    }
  };

  return (
    <Box
      boxShadow="xl"
      w="15em"
      rounded="3xl"
      overflow="hidden"
      mr="1em"
      width="35em"
      height="6em"
      mb="2em"
    >
      <Box position="relative">
        <Flex alignItems="center" pb="0.5em" pl="2.5em" pr="2.5em" pt="0.7em">
          <Heading size="md" position="relative" mr="0.7em">
            {props.activity}
          </Heading>
          <button onClick={addToSchedule}>
            <FaCalendarPlus size="1.3em" color="#299689" />
          </button>

          <Spacer />

          <Heading size="md" position="relative">
            {props.votecount}
          </Heading>
        </Flex>
      </Box>
      <Center>
        <Progress
          mt="0.5em"
          rounded="lg"
          value={(props.votecount / props.activeuser) * 100}
          height="1em"
          width="30em"
          colorScheme={progressColor()}
        />
      </Center>
    </Box>
  );
}

export default PollCount;
