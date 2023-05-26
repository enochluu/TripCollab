import React, { useState, useEffect } from "react";
import { Box, Flex, Heading, Badge, Spacer, Divider } from "@chakra-ui/react";
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

import { MdLens } from "react-icons/md";

SwiperCore.use([Navigation, Pagination]);

export default function Group({ sideActivities, status }) {
  const router = useRouter();
  const group_id = router.query.group_id;
  const underscore = group_id.indexOf("_");
  const group_name = group_id.slice(0, underscore);
  const date = group_id.slice(underscore + 1);

  return (
    <Layout>
      <Flex alignItems="baseline" mb="1em">
        <Heading size="xl">Side Activity Suggestions</Heading>

        <Spacer size="lg" />
        <Box>
          <Badge ml="0.5em" fontSize="1rem">
            {date}
          </Badge>
          <Badge ml="0.5em" fontSize="1rem">
            {group_name}
          </Badge>
        </Box>
      </Flex>

      {sideActivities.map((mainActivity) => (
        <>
          <Heading size="md" mb="0.5em">
            {mainActivity.main_activity}
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
              {mainActivity.suggestions.map((sideActivity) => (
                <li key={sideActivity.google_places_id}>
                  <SwiperSlide>
                    <NominationCard
                      activity={sideActivity}
                      group_id={group_id}
                    />
                  </SwiperSlide>
                </li>
              ))}
            </Flex>
          </Swiper>
        </>
      ))}
    </Layout>
  );
}

Group.getInitialProps = async (ctx) => {
  const { query } = ctx;
  let sideActivities = [];
  const response = await fetch(
    "http://127.0.0.1:5000/side-activities/" + query.group_id
  );
  if (response.status >= 200 && response.status <= 299) {
    sideActivities = await response.json();
  }

  return { sideActivities: sideActivities, status: response.status };
};
