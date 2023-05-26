import {
  Box,
  Flex,
  Spacer,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Slider,
  Text,
} from "@chakra-ui/react";
import { MdLens } from "react-icons/md";

const InterestSlider = ({ category }) => (
  <Flex py="1em">
    <Text fontSize="1.3em">{category}</Text>
    <Spacer />
    <Slider defaultValue={5} min={0} max={10} step={1} w="27em" size="lg">
      <SliderTrack bg="teal.300">
        <Box position="relative" />
        <SliderFilledTrack bg="teal" />
      </SliderTrack>
      <SliderThumb boxSize={6}>
        <Box color="teal.100" as={MdLens} />
      </SliderThumb>
    </Slider>
  </Flex>
);

export default InterestSlider;
