import { useState } from "react";
import { HStack } from "@chakra-ui/react";
import { AiFillStar } from "react-icons/ai";

const Rating = ({ score, size }) => {
  var stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= score) stars.push(true);
    else stars.push(false);
  }

  return (
    <>
      <HStack spacing="0.1em">
        {stars.map((star) => (
          <>
            {star ? (
              <AiFillStar size={size} key={star} color="#FF8551" />
            ) : (
              <AiFillStar size={size} key={star} color="#C4C4C4" />
            )}
          </>
        ))}
      </HStack>
    </>
  );
};

export default Rating;
