import { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  Image,
  Grid,
  GridItem,
  Spacer,
  Skeleton,
} from "@chakra-ui/react";

const Gallery = ({ location }) => {
  const API_KEY = "AIzaSyBqH3tJVTFy2V7ReFjVevGqphXdTQNUWJA"; // t
  const [zoom, setZoom] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(async () => {
    setTimeout(async () => {
      setLoading(false);
    }, 1500);
  });

  const src1 = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&key=${API_KEY}&photoreference=${location.photo_references[0]}`;
  const src2 = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=650&key=${API_KEY}&photoreference=${location.photo_references[1]}`;
  const src3 = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=500&key=${API_KEY}&photoreference=${location.photo_references[2]}`;
  const src4 = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1000&key=${API_KEY}&photoreference=${location.photo_references[3]}`;
  return (
    <Grid
      mt="2em"
      h="500px"
      templateRows="repeat(2, 1fr)"
      templateColumns="repeat(5, 1fr)"
      gap={4}
    >
      <GridItem
        rowSpan={2}
        colSpan={2}
        overflow="hidden"
        borderTopLeftRadius="2xl"
        borderBottomLeftRadius="2xl"
      >
        {loading ? (
          <Skeleton height="2500px" />
        ) : (
          <Box w="2500px">
            <Image
              fit="cover"
              src={src1}
              position="relative"
              transformOrigin="50 50"
              transition="transform 5s, filter 3s ease-in-out"
              transform={zoom ? "scale(1.4)" : "none"}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            />
          </Box>
        )}
      </GridItem>
      <GridItem colSpan={2} overflow="hidden">
        {loading ? (
          <Skeleton height="2500px" />
        ) : (
          <Box w="1000px">
            <Image
              fit="cover"
              src={src2}
              position="relative"
              transformOrigin="50 50"
              transition="transform 5s, filter 3s ease-in-out"
              transform={zoom ? "scale(1.4)" : "none"}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            />
          </Box>
        )}
      </GridItem>
      <GridItem colSpan={1} overflow="hidden" borderTopRightRadius="2xl">
        {loading ? (
          <Skeleton height="2500px" />
        ) : (
          <Box w="500px">
            <Image
              fit="cover"
              src={src3}
              transformOrigin="50 50"
              transition="transform 5s, filter 3s ease-in-out"
              transform={zoom ? "scale(1.4)" : "none"}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
            />
          </Box>
        )}
      </GridItem>
      <GridItem colSpan={3} overflow="hidden" borderBottomRightRadius="2xl">
        {loading ? (
          <Skeleton height="2500px" />
        ) : (
          <Box w="1200px">
            <Image
              fit="cover"
              src={src4}
              position="relative"
              transformOrigin="50 50"
              transition="transform 5s, filter 3s ease-in-out"
              transform={zoom ? "scale(1.4)" : "none"}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              objectPosition="center center"
            />
          </Box>
        )}
      </GridItem>
    </Grid>
  );
};
export default Gallery;
