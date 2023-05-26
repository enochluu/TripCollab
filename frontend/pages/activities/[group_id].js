import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Link,
  Alert,
  AlertTitle,
  AlertDescription,
  Text,
  Slider,
  SliderTrack,
  Skeleton,
  SliderFilledTrack,
  SliderThumb,
  Stat,
  Icon,
  Center,
  AlertIcon,
  Badge,
  Spacer,
  Stack,
  Divider,
  HStack,
  Kbd,
  Toast,
  Spinner,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  Tag,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation, Pagination } from "swiper";
import "swiper/swiper-bundle.css";
import { useRouter, withRouter } from "next/router";
import { createStandaloneToast } from "@chakra-ui/react";
import NominationCard from "../../components/NominationCard";
import SideBar from "../../components/SideBar";
import LocationSearch from "../../components/LocationSearch";
import Layout from "../../components/Layout";
import InvalidGroupName from "../../components/InvalidGroupName";
import InterestSlider from "../../components/InterestSlider";
import { MdLens } from "react-icons/md";
import { IoMdPersonAdd } from "react-icons/io";
import { signIn, signOut, useSession } from "next-auth/client";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { AiOutlineCheck } from "react-icons/ai";

SwiperCore.use([Navigation, Pagination]);

export default function Group({ nominations, status }) {
  const {
    isOpen: isOpenRating,
    onOpen: onOpenRating,
    onClose: onCloseRating,
  } = useDisclosure();

  const {
    isOpen: isOpenSuggestions,
    onOpen: onOpenSuggestions,
    onClose: onCloseSuggestions,
  } = useDisclosure();
  const { isOpen, onOpen, onClose } = useDisclosure();

  var categories = [];
  nominations.forEach((item) => {
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
  });

  const router = useRouter();

  const group_id = router.query.group_id;
  const groupLink = `localhost:3000/activities/${group_id}`;

  const underscore = group_id.indexOf("_");
  const group_name = group_id.slice(0, underscore);
  const date = group_id.slice(underscore + 1);
  const numNominations = nominations.length;
  const [session, loading] = useSession();

  if (status > 200) {
    return <InvalidGroupName group_id={group_id} />;
  }

  const [nature, setNature] = useState(5);
  const [sightseeing, setSightseeing] = useState(5);
  const [sports, setSports] = useState(5);
  const [recreation, setRecreation] = useState(5);
  const [picnic, setPicnic] = useState(5);
  const [cultural, setCultural] = useState(5);

  const [location, setLocation] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const sendLocation = async () => {
    const response = await fetch(
      `http://127.0.0.1:5000/location?group_id=${router.query.group_id}`
    );
    if (response.status >= 200 && response.status <= 299) {
      const loc = await response.json();
      setLocation(loc.location);
      console.log(location);
    } else {
      console.log("error");
    }
    onOpenRating();
  };

  const findActivities = async () => {
    // console.log(location);
    onCloseRating();
    onOpenSuggestions();
    const response2 = await fetch(
      `http://127.0.0.1:5000/activities/suggest?location=${location}&nature=${nature}&sightseeing=${sightseeing}&sport=${sports}&recreation=${recreation}&picnic=${picnic}&cultural=${cultural}`
    );
    if (response2.status >= 200 && response2.status <= 299) {
      const sugg = await response2.json();
      setSuggestions(sugg);
      // console.log(suggestions);
      console.log(sugg);
    } else {
      console.log("error");
    }
  };

  return (
    <Layout>
      <Flex alignItems="baseline" mb="1em">
        <Heading size="xl">Nominations</Heading>
        <Button
          ml="0.2em"
          onClick={sendLocation}
          color="teal.500"
          variant="ghost"
          size="sm"
        >
          Don't know where to go?
        </Button>
        <Spacer size="lg" />
        <Box>
          <Popover>
            <PopoverTrigger>
              <Button size="sm">
                <CopyToClipboard text={groupLink}>
                  <IoMdPersonAdd size="1.33em" />
                </CopyToClipboard>
              </Button>
            </PopoverTrigger>

            <PopoverContent>
              <PopoverArrow />
              <PopoverCloseButton />
              <PopoverHeader>
                <Flex alignItems="center">
                  <AiOutlineCheck />
                  <Text ml="0.5em">Link Copied to Clipboard!</Text>
                </Flex>
              </PopoverHeader>
              <PopoverBody>
                Send this to your group to invite them here.
              </PopoverBody>
            </PopoverContent>
          </Popover>
          <Badge ml="0.5em" fontSize="1rem">
            {date}
          </Badge>
          <Badge ml="0.5em" fontSize="1rem">
            {group_name}
          </Badge>
        </Box>
      </Flex>

      <LocationSearch />
      {numNominations === 0 ? (
        <Alert status="info">
          <AlertIcon />
          Add your first nomination by searching for a place above! If you want
          personalised suggestions, click 'Don't know where to go?'
        </Alert>
      ) : (
        ""
      )}
      {categories.map((category) => (
        <>
          <Heading size="md" mb="0.5em">
            {category}
          </Heading>
          <Swiper
            tag="Section"
            grabCursor="true"
            slidesPerView={6}
            spaceBetween={50}
            navigation
            style={{ height: "22em", paddingLeft: "0.5em" }}
          >
            <Flex>
              {nominations
                .filter((activity) => category == activity.category)
                .map((activity) => (
                  <li key={activity.activity_id}>
                    <SwiperSlide>
                      <NominationCard
                        activity={activity}
                        group_id={group_id}
                        type="nomination"
                      />
                    </SwiperSlide>
                  </li>
                ))}
            </Flex>
          </Swiper>
        </>
      ))}

      <Modal onClose={onCloseRating} isOpen={isOpenRating} isCentered>
        <ModalOverlay />
        <ModalContent maxW="55em" h="45em" borderRadius="5em">
          <ModalHeader textAlign="center" fontSize="2.3em" pt="2em">
            Rate your interest in each type of activity
          </ModalHeader>
          <ModalBody px="10em" py="2em">
            <Flex py="1em">
              <Text fontSize="1.3em">Nature</Text>
              <Spacer />
              <Slider
                defaultValue={5}
                min={0}
                max={10}
                step={1}
                w="27em"
                size="lg"
                onChangeEnd={(val) => setNature(val)}
              >
                <SliderTrack bg="teal.300">
                  <Box position="relative" />
                  <SliderFilledTrack bg="teal" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="teal.100" as={MdLens} />
                </SliderThumb>
              </Slider>
            </Flex>
            <Flex py="1em">
              <Text fontSize="1.3em">Sightseeing</Text>
              <Spacer />
              <Slider
                defaultValue={5}
                min={0}
                max={10}
                step={1}
                w="27em"
                size="lg"
                onChangeEnd={(val) => setSightseeing(val)}
              >
                <SliderTrack bg="teal.300">
                  <Box position="relative" />
                  <SliderFilledTrack bg="teal" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="teal.100" as={MdLens} />
                </SliderThumb>
              </Slider>
            </Flex>
            <Flex py="1em">
              <Text fontSize="1.3em">Sports</Text>
              <Spacer />
              <Slider
                defaultValue={5}
                min={0}
                max={10}
                step={1}
                w="27em"
                size="lg"
                onChangeEnd={(val) => setSports(val)}
              >
                <SliderTrack bg="teal.300">
                  <Box position="relative" />
                  <SliderFilledTrack bg="teal" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="teal.100" as={MdLens} />
                </SliderThumb>
              </Slider>
            </Flex>
            <Flex py="1em">
              <Text fontSize="1.3em">Recreation</Text>
              <Spacer />
              <Slider
                defaultValue={5}
                min={0}
                max={10}
                step={1}
                w="27em"
                size="lg"
                onChangeEnd={(val) => setRecreation(val)}
              >
                <SliderTrack bg="teal.300">
                  <Box position="relative" />
                  <SliderFilledTrack bg="teal" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="teal.100" as={MdLens} />
                </SliderThumb>
              </Slider>
            </Flex>
            <Flex py="1em">
              <Text fontSize="1.3em">Picnic</Text>
              <Spacer />
              <Slider
                defaultValue={5}
                min={0}
                max={10}
                step={1}
                w="27em"
                size="lg"
                onChangeEnd={(val) => setPicnic(val)}
              >
                <SliderTrack bg="teal.300">
                  <Box position="relative" />
                  <SliderFilledTrack bg="teal" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="teal.100" as={MdLens} />
                </SliderThumb>
              </Slider>
            </Flex>
            <Flex py="1em">
              <Text fontSize="1.3em">Cultural</Text>
              <Spacer />
              <Slider
                defaultValue={5}
                min={0}
                max={10}
                step={1}
                w="27em"
                size="lg"
                onChangeEnd={(val) => setCultural(val)}
              >
                <SliderTrack bg="teal.300">
                  <Box position="relative" />
                  <SliderFilledTrack bg="teal" />
                </SliderTrack>
                <SliderThumb boxSize={6}>
                  <Box color="teal.100" as={MdLens} />
                </SliderThumb>
              </Slider>
            </Flex>
          </ModalBody>
          <Center>
            <ModalFooter pb="6em">
              <Button
                onClick={findActivities}
                colorScheme="teal"
                height="3em"
                width="12em"
                borderRadius="3em"
                type="submit"
              >
                Find activities
              </Button>
            </ModalFooter>
          </Center>
        </ModalContent>
      </Modal>
      <Modal onClose={onCloseSuggestions} isOpen={isOpenSuggestions} isCentered>
        <ModalOverlay />
        <ModalContent maxW="55em" h="45em" borderRadius="5em">
          <ModalHeader textAlign="center" fontSize="2.3em" pt="2em">
            Suggestions based on your response
          </ModalHeader>
          <ModalBody>
            {suggestions.length === 0 ? (
              // <Skeleton h="25em" />
              <Center h="25em">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="teal.500"
                  size="xl"
                />
              </Center>
            ) : (
              <Center h="25em">
                <Flex>
                  {suggestions.map((suggestion) => (
                    <Box key={suggestion.google_places_id}>
                      <NominationCard
                        activity={suggestion}
                        group_id={group_id}
                        type="suggestion"
                      />
                    </Box>
                  ))}
                </Flex>
              </Center>
            )}
          </ModalBody>
          <Center>
            <ModalFooter pb="3em">
              <Button
                onClick={onCloseSuggestions}
                colorScheme="teal"
                height="3em"
                width="15em"
                borderRadius="3em"
              >
                Return to nominations
              </Button>
            </ModalFooter>
          </Center>
        </ModalContent>
      </Modal>
    </Layout>
  );
}

Group.getInitialProps = async (ctx) => {
  const { query } = ctx;
  let nominations = [];
  const response = await fetch(
    "http://127.0.0.1:5000/activities/" + query.group_id
  );
  if (response.status >= 200 && response.status <= 299) {
    nominations = await response.json();
  }

  return { nominations: nominations, status: response.status };
};
