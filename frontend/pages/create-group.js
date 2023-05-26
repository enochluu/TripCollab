import React from "react";
import {
  Box,
  Center,
  Flex,
  Text,
  Heading,
  Spacer,
  Input,
  Divider,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormLabel,
  FormControl,
} from "@chakra-ui/react";
import { GiSchoolBag } from "react-icons/gi";
import Link from "next/link";
import { useSession } from "next-auth/client";
import { createStandaloneToast } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function CreateGroup() {
  const [joinGroupID, setJoinGroupID] = React.useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [session, loading] = useSession();
  const router = useRouter();
  const [groupName, setGroupName] = React.useState("");
  const handleChange = (event) => setGroupName(event.target.value);
  const [date, setDate] = React.useState("");
  const handleChange1 = (event) => setDate(event.target.value);
  const [tripLocation, settripLocation] = React.useState("");
  const handleChange2 = (event) => settripLocation(event.target.value);
  let token = "sample";
  if (session != null) {
    token = session.accessToken;
  }
  const [groupID, setGroupID] = React.useState("");

  React.useEffect(() => {
    setGroupID(`activities/${groupName}_${date}`);
  }, [date, groupName]);
  console.log(joinGroupID);
  const handleChange3 = (event) => setJoinGroupID(event.target.value);

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

  const makeGroup = async () => {
    if (groupName.length == 0 || date.length == 0 || tripLocation.length == 0) {
      toast({
        title: "An error occurred.",
        description: "All fields must be filled",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (!groupName.match(/^[a-zA-Z0-9\-\ ]*$/)) {
      toast({
        title: "An error occurred.",
        description: "Group name may only letters, spaces and hyphens",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    if (!date.match(/^\d{4}-([0]\d|1[0-2])-([0-2]\d|3[01])$/)) {
      toast({
        title: "An error occurred.",
        description: "Date must be in ISO format: YYYY-MM-DD",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const postURL = "http://127.0.0.1:5000/group";
    const reqOptions = {
      body: JSON.stringify({
        token: token,
        group_name: groupName,
        trip_date: date,
        location: tripLocation,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    };
    try {
      const res = await fetch(postURL, reqOptions);
      if (res.status == 200) {
        router.push(`${groupID}`);
      } else if (res.status == 400) {
        runToast("Group name has already been taken. Please try another name.");
      }
    } catch {
      toast({
        title: "An error occurred.",
        description: "Please try a different group name",
        status: "error",
        duration: 9000,
        isClosable: true,
        position: "top",
      });
      router.push(`/`);
    }
  };
  return (
    <>
      <Center>
        <Flex
          bgGradient="linear(to-l, #42C0B1, #299689)"
          mt="7em"
          width="45em"
          height="15em"
          color="white"
          alignItems="center"
          justifyContent="center"
          borderRadius="4em"
        >
          <Link href="/">
            <GiSchoolBag size={170} />
          </Link>
          <Flex flexDirection="column">
            <Heading fontSize="7xl">Trip Collab</Heading>
            <Text fontSize="3xl" ml="0.5rem">
              Decide and Plan Together
            </Text>
          </Flex>
        </Flex>
      </Center>
      <Center>
        <Flex mt="2em">
          <div>
            <Flex alignItems="baseline">
              <Text mb="8px" mr="0.5em">
                Please enter the name of your group:
              </Text>
              <Heading color="teal.500" size="xs">
                {groupName}
              </Heading>
            </Flex>

            <Input
              value={groupName}
              onChange={handleChange}
              placeholder="Group Name"
              size="md"
              width="40em"
            />
          </div>
        </Flex>
      </Center>
      <Center>
        <Flex mt="1em">
          <div>
            <Flex alignItems="baseline">
              <Text mb="8px" mr="0.5em">
                Please enter the date of your trip:
              </Text>
              <Heading color="teal.500" size="xs">
                {date}
              </Heading>
            </Flex>

            <Input
              value={date}
              onChange={handleChange1}
              placeholder="YYYY-MM-DD"
              size="md"
              width="40em"
            />
          </div>
        </Flex>
      </Center>
      <Center>
        <Flex mt="1em">
          <div>
            <Flex alignItems="baseline">
              <Text mb="8px" mr="0.5em">
                Please enter the location of your trip:
              </Text>
              <Heading color="teal.500" size="xs">
                {tripLocation}
              </Heading>
            </Flex>
            <Input
              value={tripLocation}
              onChange={handleChange2}
              placeholder="Location"
              size="md"
              width="40em"
            />
          </div>
        </Flex>
      </Center>
      <Center>
        <Button
          onClick={makeGroup}
          colorScheme="teal"
          width="12em"
          borderRadius="1em"
          mt="2em"
        >
          Create New Group
        </Button>
      </Center>
      <Center>
        <Button
          onClick={onOpen}
          colorScheme="teal"
          variant="outline"
          width="12em"
          borderRadius="1em"
          mt="1em"
        >
          Know Group ID?
        </Button>
      </Center>

      <Center>
        <Divider mt="5em" width="60%" />
      </Center>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Join Existing Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group ID</FormLabel>
              <Input
                placeholder="Group ID"
                value={joinGroupID}
                onChange={handleChange3}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => router.push(`activities/${joinGroupID}`)}
            >
              Join
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
