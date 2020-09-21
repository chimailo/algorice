import React from "react";
import { useDispatch } from "react-redux";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import ReplayIcon from "@material-ui/icons/Replay";
import { getProfile } from "../../slices/user";

export function ProfileError({ username }: { username: any }) {
  const dispatch = useDispatch();

  return (
    <div>
      <Box mt={4} style={{ textAlign: "center" }}>
        <Typography>An error occured</Typography>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<ReplayIcon />}
          onClick={() => dispatch(getProfile(username))}
          style={{ marginRight: 8 }}
        >
          Retry
        </Button>
      </Box>
    </div>
  );
}
