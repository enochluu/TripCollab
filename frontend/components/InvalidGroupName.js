import {
  Box,
  Alert,
  AlertTitle,
  AlertDescription,
  AlertIcon,
} from "@chakra-ui/react";
import Layout from "./Layout";

const InvalidGroupName = ({ group_id }) => (
  <Layout>
    <Alert status="error">
      <AlertIcon />
      <Box flex="1">
        <AlertTitle>Group '{group_id}' does not exist!</AlertTitle>
        <AlertDescription display="block">
          Please check that you have used the correct link and try again.
        </AlertDescription>
      </Box>
    </Alert>
  </Layout>
);

export default InvalidGroupName;
