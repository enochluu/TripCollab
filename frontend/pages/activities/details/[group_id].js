import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  Image,
  Grid,
  GridItem,
  Divider,
  Spacer,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tag,
  Badge,
  SlideFade,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import Layout from "../../../components/Layout";
import Gallery from "../../../components/Gallery";
import ActivityInfo from "../../../components/ActivityInfo";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import Link from "next/link";
import LocationSearch from "../../../components/LocationSearch";
import InvalidGroupName from "../../../components/InvalidGroupName";

export default function Details({ location, status }) {
  console.log(status);
  const [show, setShow] = React.useState(true);
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [nominated, setNominated] = React.useState(false);
  let isSuccess = false;
  if (Object.keys(location).length !== 0) {
    isSuccess = true;
  }
  const activitesLink = `/activities/${router.query.group_id}`;
  const nominate = async () => {
    setLoading(true);
    const group_id = router.query.group_id;
    const postURL = `http://127.0.0.1:5000/activities/nominate`;
    const reqOptions = {
      body: JSON.stringify({
        group_id: group_id,
        google_places_id: location.google_places_id,
        activity_name: location.place_name,
        rating: location.rating,
        photo_reference: location.photo_references[0],
        category: location.category,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    };
    const res = await fetch(postURL, reqOptions);
    location = await res.json();
    console.log(location);
    setLoading(false);
    setNominated(true);
  };

  if (status > 200) {
    isSuccess = false;
  }

  return (
    <Layout>
      {!isSuccess ? (
        <>
          <Alert status="error" mb="1em">
            <AlertIcon />
            <AlertTitle mr={2}>No result found!</AlertTitle>
            <AlertDescription>
              Your search may not have been specific enough. Please try again.
            </AlertDescription>
          </Alert>
          <LocationSearch />
        </>
      ) : (
        <SlideFade in={show} offsetY="-70px">
          <Flex alignItems="baseline">
            <Link href={activitesLink}>
              <IoIosArrowBack size="1em" color="#319795" />
            </Link>

            <Heading _hover={{ bg: "#ebedf0" }}>{location.place_name}</Heading>
            <Badge ml="1em">{location.category}</Badge>
            <Spacer />
            {loading ? (
              <Button
                alignSelf="center"
                onClick={nominate}
                isLoading
                loadingText="Nominating"
                colorScheme="teal"
              >
                Nominate
              </Button>
            ) : (
              <Button
                onClick={nominate}
                colorScheme="teal"
                isDisabled={nominated ? true : false}
              >
                {nominated ? "Nominated" : "Nominate"}
              </Button>
            )}
          </Flex>
          <Divider mt="1em" />
          <Gallery location={location} />
          <ActivityInfo location={location} />
        </SlideFade>
      )}
    </Layout>
  );
}

Details.getInitialProps = async (ctx) => {
  const { query } = ctx;
  // console.log(query);

  const response = await fetch(
    "http://127.0.0.1:5000/search?activity=" + query.place_name
  );
  let location = [];
  if (response.status >= 200 && response.status <= 299) {
    location = await response.json();
  }

  return { location: location, status: response.status };
};
