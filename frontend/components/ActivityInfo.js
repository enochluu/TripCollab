import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Icon,
  HStack,
  Flex,
  Image,
  Divider,
  Link,
  UnorderedList,
  List,
  ListItem,
  ListIcon,
  Stack,
  Tag,
  Badge,
} from "@chakra-ui/react";
import {
  FaGlobeAmericas,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaClock,
} from "react-icons/fa";
import { BsFillChatSquareDotsFill } from "react-icons/bs";
import { RiCheckboxCircleFill, RiCloseCircleFill } from "react-icons/ri";

import Rating from "./Rating";

function convertUnixTime(unix) {
  let a = new Date(unix * 1000),
    year = a.getFullYear(),
    months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ],
    month = months[a.getMonth()],
    date = a.getDate();
  return `${month} ${date}, ${year}`;
}

const ActivityInfo = ({ location }) => {
  const googleMapsLink = `https://www.google.com/maps/search/${location.place_name}`;
  if (location.reviews == null) {
    location.reviews = [];
  }
  console.log(location.opening_hours);

  return (
    <Accordion mt="2em" allowMultiple>
      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaMapMarkerAlt} />
                <Text fontSize="xl">Address</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Link color="teal.500" href={googleMapsLink} target="_blank">
            {location.address}
          </Link>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaPhoneAlt} />
                <Text fontSize="xl">Phone</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>{location.phone_number}</AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaGlobeAmericas} />
                <Text fontSize="xl">Website</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <Link color="teal.500" href={location.website} target="_blank">
            {location.website}
          </Link>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={FaClock} />
                <Text fontSize="xl">Opening Hours</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <List spacing={3} ml="0.25em">
            {location.opening_hours ? (
              <>
                {location.opening_hours.map((day) => (
                  <ListItem key={day}>
                    <ListIcon
                      as={
                        day.includes("losed")
                          ? RiCloseCircleFill
                          : RiCheckboxCircleFill
                      }
                      color={day.includes("Closed") ? "red.500" : "green.500"}
                    />
                    {day}
                  </ListItem>
                ))}{" "}
              </>
            ) : (
              <ListItem>
                <ListIcon as={RiCloseCircleFill} color="red.500" />
                Closed
              </ListItem>
            )}
          </List>
        </AccordionPanel>
      </AccordionItem>

      <AccordionItem>
        <h2>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              <HStack>
                <Icon as={BsFillChatSquareDotsFill} />
                <Text fontSize="xl">Reviews</Text>
              </HStack>
            </Box>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          {location.reviews.map((review) => (
            <>
              <Flex mt="1em" mb="1em">
                <Image w="4em" h="4em" src={review.profile_photo_url} />
                <Box ml="2em">
                  <Flex alignItems="center">
                    <Stack spacing="2px">
                      <Flex alignItems="center">
                        <Text mr="0.5em" fontSize="lg">
                          {review.author_name}
                        </Text>
                        <Badge ml="0.25em">
                          {convertUnixTime(review.time)}
                        </Badge>
                      </Flex>

                      <Rating score={review.rating} />
                    </Stack>
                  </Flex>
                  <Text>{review.text}</Text>
                </Box>
              </Flex>
              <Divider />
            </>
          ))}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export default ActivityInfo;
