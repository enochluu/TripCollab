import React from "react";
import {
  Box,
  Badge,
  Center,
  Flex,
  Text,
  Image,
  Button,
  Link,
  LinkBox,
  LinkOverlay,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
  useDisclosure,
} from "@chakra-ui/react";
import { FaStar, FaRegStar } from "react-icons/fa";
import { AiFillPlusCircle, AiFillCheckCircle } from "react-icons/ai";
import { Swiper, SwiperSlide } from "swiper/react";
import Rating from "./Rating";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { signIn, signOut, useSession } from "next-auth/client";
import { createStandaloneToast } from "@chakra-ui/react";
import { v4 as uuidv4 } from "uuid";

const NominationCard = ({ activity, group_id, type }) => {
  const [session, loading] = useSession();
  const router = useRouter();
  const [vote, setVote] = React.useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loggedIn, setLoggedIn] = React.useState(false);
  const cancelRef = React.useRef();

  console.log(session);
  const toast = createStandaloneToast();
  const runErrorToast = (msg) =>
    toast({
      title: "An error occurred.",
      description: `${msg}`,
      status: "error",
      duration: 3000,
      isClosable: true,
      position: "top",
    });

  const runSuccessToast = (msg) =>
    toast({
      title: "Success!",
      description: `${msg}`,
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });

  const login = async () => {
    if (session == null) {
      signIn();
    } else if (session.accessToken == null) {
      // not logged in
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
      runErrorToast("Please try again");
    }
  };

  const addVote = () => {
    onClose();
    login();
    if (vote === false) {
      let postURL = `http://127.0.0.1:5000/activities/vote`;
      let reqOptions = {
        body: JSON.stringify({
          activity_id: activity.activity_id,
          token: session.accessToken,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      };
      fetch(postURL, reqOptions)
        .then((response) => {
          response.status == 200
            ? runSuccessToast("You have voted for this activity")
            : onOpen();
        })
        .catch((err) => console.log(err));
      setVote(true);
    } else {
      fetch(
        `http://127.0.0.1:5000/activities/vote?activity_id=${activity.activity_id}&token=${session.accessToken}`,
        { method: "DELETE" }
      )
        .then((response) => {
          response.status !== 200
            ? runErrorToast("You have not yet voted for this activity")
            : runSuccessToast("You have removed your vote for this activity");
        })
        .catch((err) => console.log(err));
      setVote(false);
    }
  };
  const addToSchedule = async () => {
    login();
    if (vote === false) {
      let postURL = `http://127.0.0.1:5000/side-activities`;
      let reqOptions = {
        body: JSON.stringify({
          token: session.accessToken,
          group_id: group_id,
          google_places_id: activity.google_places_id,
          activity_name: activity.activity_name,
          rating: activity.rating,
          photo_reference: activity.photo_reference,
          category: activity.category,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      };
      try {
        let data = await fetch(postURL, reqOptions);
        console.log(data);

        if (data.status !== 200) {
          runErrorToast("This activity is already in the schedule.");
        } else {
          runSuccessToast("Side activity has been added to the schedule");
        }
      } catch {
        runErrorToast("This activity is already in the schedule.");
      }
      setVote(true);
    } else {
      runErrorToast(
        "This activity is already in the schedule. If you can want to remove it, please go to the schedule."
      );
    }
  };

  const detailsLink = `details/${group_id}?place_name=${activity.activity_name}`;

  const API_KEY = "AIzaSyBqH3tJVTFy2V7ReFjVevGqphXdTQNUWJA";

  const photo_src = `data:image/png;base64, ${activity.photo_content}`;
  return (
    <Box boxShadow="xl" w="15em" rounded="3xl" overflow="hidden" mr="1em">
      <Box position="relative">
        <Image
          h="11em"
          w="15em"
          fit="fill"
          src={photo_src}
          fallbackSrc="https://wolper.com.au/wp-content/uploads/2017/10/image-placeholder.jpg"
          position="relative"
        />
        {type != "suggestion" && (
          <Box
            rounded="lg"
            position="absolute"
            top="8em"
            bottom="0.6em"
            left="12em"
            bg="white"
            p="0.4em"
          >
            <button onClick={type === "nomination" ? addVote : addToSchedule}>
              {vote ? (
                <AiFillCheckCircle size="1.5em" color="#299689" />
              ) : (
                <AiFillPlusCircle size="1.5em" color="#9A9A9A" />
              )}
            </button>
          </Box>
        )}
      </Box>
      <LinkBox>
        <Flex
          flexDirection="column"
          justifyContent="center"
          p="3"
          h="8em"
          bg="white"
        >
          <Text fontSize="lg" mb="0.5em">
            <NextLink href={detailsLink} passHref>
              <LinkOverlay>{activity.activity_name}</LinkOverlay>
            </NextLink>
          </Text>
          <Flex mb="1em">
            <Rating score={activity.rating} size="1.6em" />
          </Flex>
        </Flex>
      </LinkBox>
      <AlertDialog
        motionPreset="slideInBottom"
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        isOpen={isOpen}
        isCentered
      >
        <AlertDialogOverlay />

        <AlertDialogContent>
          <AlertDialogHeader>Unvoke Activity?</AlertDialogHeader>
          <AlertDialogCloseButton />
          <AlertDialogBody>
            You have already voted for this activity. Do you wish to unvote this
            activity?
          </AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              No
            </Button>
            <Button
              colorScheme="red"
              ml={3}
              onClick={type === "nomination" ? addVote : addToSchedule}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  );
};

export default NominationCard;
