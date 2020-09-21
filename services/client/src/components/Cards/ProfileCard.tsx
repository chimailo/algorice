import React, { Fragment, useState } from "react";
import { Link as RouterLink, useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import moment from "moment";

import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import CakeOutlinedIcon from "@material-ui/icons/CakeOutlined";
import CalendarTodayOutlinedIcon from "@material-ui/icons/CalendarTodayOutlined";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import EditProfileModal from "../Modal/EditProfile";
import { follow, unfollow } from "../../slices/user";
import { RootState } from "../../rootReducer";
import { User } from "../../types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      margin: "4px 0",
      padding: theme.spacing(1, 1, 2),
    },
    profile: {
      display: "flex",
    },
    avatar: {
      width: 60,
      height: 60,
      border: `2px solid ${theme.palette.primary.main}`,
      [theme.breakpoints.up("sm")]: {
        width: 80,
        height: 80,
      },
    },
    profileWrapper: {
      flexGrow: 1,
      display: "flex",
      flexDirection: "column",
      marginLeft: theme.spacing(1),
    },
    flex: {
      display: "flex",
      alignItems: "center",
    },
    nameText: {
      flex: "1",
      width: 0,
      marginRight: theme.spacing(1),
    },
    button: {
      marginRight: theme.spacing(1),
      color: theme.palette.text.primary,
      fontWeight: theme.typography.fontWeightBold,
    },
    marginRight: {
      marginRight: theme.spacing(1),
    },
  })
);

export default function ProfileCard({ user }: { user: User }) {
  const [isModalOpen, setModalOpen] = useState(false);
  const classes = useStyles();

  const { pathname } = useLocation();
  const { username } = useParams();

  const dispatch = useDispatch();
  const { user: auth } = useSelector((state: RootState) => state.auth);
  const { following } = useSelector((state: RootState) => state.user);

  const isFollowing = (id: number) => following.some((f) => f.id === id);

  const handleFollowClick = (id: number) =>
    isFollowing(id) ? dispatch(unfollow(id)) : dispatch(follow(id));

  const handleEditModalOpen = () => setModalOpen(true);

  const handleEditModalClose = () => setModalOpen(false);

  return (
    <Paper elevation={0} classes={{ root: classes.paper }}>
      <div className={classes.profile}>
        <Avatar
          src={user ? user.profile.avatar : "undefined"}
          alt={`${user && user.username} gravatar`}
          className={classes.avatar}
        />
        <div className={classes.profileWrapper}>
          <Box className={classes.flex} mb={1}>
            <div className={classes.nameText}>
              <Typography
                variant="subtitle2"
                component="h6"
                noWrap
                style={{ fontWeight: 600 }}
              >
                {user && user.profile.name}
              </Typography>
              <Typography
                color="textSecondary"
                variant="subtitle2"
                component="h6"
                noWrap
              >
                {user && `@${user.username}`}
              </Typography>{" "}
            </div>
            {auth?.id === user?.id ? (
              <Button
                variant="outlined"
                color="primary"
                aria-controls="edit profile"
                aria-haspopup="true"
                size="small"
                disableElevation
                style={{ textTransform: "capitalize" }}
                onClick={() => handleEditModalOpen()}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                size="small"
                disableElevation
                style={{ textTransform: "capitalize" }}
                onClick={() => handleFollowClick(user.id)}
              >
                {isFollowing(user.id) ? "following" : "follow"}
              </Button>
            )}
            <EditProfileModal
              isOpen={isModalOpen}
              handleClose={handleEditModalClose}
            />
          </Box>
          <Typography variant="body2" component="p" paragraph>
            {user ? `${user.profile.bio}` : ""}
          </Typography>
          {(pathname.split("/").includes("profile") ||
            pathname.split("/").includes("replies") ||
            pathname.split("/").includes("likes")) && (
            <Fragment>
              <div className={classes.flex}>
                <Typography
                  variant="body2"
                  component="p"
                  color="textSecondary"
                  gutterBottom
                  className={classes.flex}
                >
                  <CalendarTodayOutlinedIcon
                    fontSize="small"
                    className={classes.marginRight}
                  />{" "}
                  joined:{" "}
                  {`${
                    user && moment(user.profile.created_on).format("MMM YYYY")
                  } `}
                </Typography>
                <Typography
                  variant="body2"
                  component="p"
                  color="textSecondary"
                  gutterBottom
                  style={{ marginLeft: 16 }}
                  className={classes.flex}
                >
                  <CakeOutlinedIcon
                    fontSize="small"
                    className={classes.marginRight}
                  />{" "}
                  {`${
                    user && user.profile.dob
                      ? "dob: " + moment(user.profile.dob).format("DD / MM")
                      : ""
                  } `}
                </Typography>
              </div>
              <div className={classes.flex}>
                <Typography variant="body2" component="p" color="textSecondary">
                  <Link
                    color="inherit"
                    to={`/${username}/followers`}
                    component={RouterLink}
                  >
                    <span className={classes.button}>
                      {`${user.followers.length}`}
                    </span>
                    Followers
                  </Link>
                  <Link
                    color="inherit"
                    to={`/${username}/following`}
                    component={RouterLink}
                    style={{ marginLeft: 24 }}
                  >
                    <span className={classes.button}>
                      {`${user.followed.length}`}
                    </span>
                    Following
                  </Link>
                </Typography>
              </div>
            </Fragment>
          )}
        </div>
      </div>
    </Paper>
  );
}
