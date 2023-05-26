import React from "react";
import Link from "next/link";
import {
  Box,
  Flex,
  Heading,
  Button,
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  HStack,
  Spacer,
  Form,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { AiOutlineSearch } from "react-icons/ai";
import { useRouter, withRouter } from "next/router";
import Router from "next/router";

const LocationSearch = () => {
  const [location, setLocation] = useState("");
  const router = useRouter();
  const group_id = router.query.group_id;

  const search = (event) => {
    event.preventDefault();
    router.push(`details/${group_id}?place_name=${location}`);
  };

  return (
    <form onSubmit={search}>
      <Flex
        borderWidth="1px"
        borderRadius="lg"
        flexDirection="row"
        alignItems="center"
        width="20em"
        pr="0.6em"
        mb="1em"
      >
        <Input
          borderWidth="0"
          p="0.5em"
          colorScheme="blue"
          id="search"
          id="search"
          placeholder="Search for place"
          value={location}
          onChange={({ target }) => setLocation(target.value)}
          w="30em"
          mr="0.5em"
        />
        <Link href={`/activities/details/${group_id}?place_name=${location}`}>
          <a>
            <AiOutlineSearch
              size="1.5em"
              color={location == "" ? "black" : "#4d9795"}
            />
          </a>
        </Link>
      </Flex>
    </form>
  );
};

export default LocationSearch;
