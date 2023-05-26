import React, { useState, useEffect } from "react";
import PollCount from "../../components/PollCount";
import { Box, Heading, Center } from "@chakra-ui/react";
import Layout from "../../components/Layout";
import InvalidGroupName from "../../components/InvalidGroupName";
import { useRouter } from "next/router";

export default function Poll({ votes, status }) {
  const router = useRouter();

  if (status > 200) {
    return <InvalidGroupName group_id={router.query.group_id} />;
  }
  var activities = [];
  var activeusers = votes.active_user;
  votes.activity_poll.forEach((item) => {
    if (!activities.includes(item.activity_name)) {
      activities.push(item.activity_name);
    }
  });
  var length = activities.length;
  var count = activities.length;
  return (
    <Layout>
      <Box>
        <Center>
          <Heading size="xl" mb="0.5em">
            Poll Count
          </Heading>
        </Center>
        {activities.map((activity_name) => (
          <Center>
            {votes.activity_poll
              .filter((activity) => activity_name == activity.activity_name)
              .map((activity) => (
                <Box>
                  <PollCount
                    activity={activity_name}
                    activity_id={activity.activity_id}
                    votecount={activity.vote_count}
                    activeuser={activeusers}
                    length={length}
                    count={(count = count - 1)}
                  />
                </Box>
              ))}
          </Center>
        ))}
      </Box>
    </Layout>
  );
}

Poll.getInitialProps = async (ctx) => {
  const { query } = ctx;
  let votes = [];
  const response = await fetch("http://127.0.0.1:5000/poll/" + query.group_id);
  if (response.status >= 200 && response.status <= 299) {
    votes = await response.json();
  }
  return { votes: votes, status: response.status };
};
