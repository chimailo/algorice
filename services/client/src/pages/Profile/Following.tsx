import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import axios from "axios";

import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import ReplayIcon from "@material-ui/icons/Replay";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import FollowTab from "../../components/Tabs/FollowTab";
import Header from "../../components/Main/Header";
import ProfileCard from "../../components/Cards/ProfileCard";
import Sidebar from "../../components/Sidebar";
import SideMenu from "../../components/Menu/SideMenu";
import setAuthToken from "../../utils/axiosConfig";
import { ProfileError } from "../../components/Loading/LoadingError";
import { RootState } from "../../rootReducer";
import { getProfile } from "../../slices/user";
import { User } from "../../types";
import { Box } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    main: {
      [theme.breakpoints.up("sm")]: {
        marginLeft: 104,
      },
      [theme.breakpoints.up("lg")]: {
        marginLeft: 244,
      },
    },
    paper: {
      margin: "4px 0",
      display: "flex",
      padding: theme.spacing(1, 1, 2),
    },
    avatar: {
      width: 60,
      height: 60,
    },
    userInfo: {
      display: "flex",
      flexDirection: "column",
      marginLeft: theme.spacing(1),
    },
    userName: {
      display: "flex",
      alignItems: "center",
    },
    nameText: {
      flexGrow: 1,
    },
  })
);

export default function FollowingTab() {
  const [following, setFollowing] = useState<User[]>([]);
  const [count, setCount] = useState<User[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setNext] = useState(false);

  const classes = useStyles();
  const { username } = useParams();
  const scrollRef = useRef(null);

  const dispatch = useDispatch();
  const { user, hasError, loading } = useSelector(
    (state: RootState) => state.user
  );

  const getFollowing = async (username: string, page: number) => {
    setLoading(true);
    localStorage.token && setAuthToken(localStorage.token);

    try {
      const response = await axios.get(
        `/users/${username}/following/page/${page}`
      );

      setFollowing([...following, ...response.data.following]);
      setNext(response.data.hasNext);
      setCount(response.data.count);
    } catch (error) {
      setError(true);
    }
    setLoading(false);
  };

  const scrollObserver = useCallback(
    (node) => {
      if (isLoading) return;
      new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasNext) {
            setPage((prevPage) => prevPage + 1);
            observer.unobserve(entry.target);
          }
        });
      }, {}).observe(node);
    },
    [isLoading, hasNext]
  );

  useEffect(() => {
    dispatch(getProfile(username));
  }, [dispatch, username]);

  useEffect(() => {
    getFollowing(username, page);
  }, [username, page]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollObserver(scrollRef.current);
    }
  }, [scrollObserver]);

  return (
    <Fragment>
      {hasError ? (
        <ProfileError username={username} />
      ) : loading || user === null ? (
        <CircularProgress />
      ) : (
        <Container maxWidth="xl" disableGutters>
          <Hidden xsDown>
            <SideMenu />
          </Hidden>
          <div className={classes.main}>
            <Grid container spacing={1}>
              <Grid item xs={12} md={8}>
                <Header
                  title={user && user.profile.name}
                  meta={`${count} following`}
                />
                <FollowTab username={username} />
                {following.map((follower, index) => {
                  if (following.length - 1 === index) {
                    return (
                      <div key={follower.id} ref={scrollRef}>
                        <ProfileCard user={follower} />
                      </div>
                    );
                  } else {
                    return (
                      <div key={follower.id}>
                        <ProfileCard user={follower} />
                      </div>
                    );
                  }
                })}
                {loading && <CircularProgress />}
                {error && (
                  <Box mt={4} style={{ textAlign: "center" }}>
                    <Typography>An error occured</Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<ReplayIcon />}
                      onClick={() => dispatch(getFollowing(username, page))}
                      style={{ marginRight: 8 }}
                    >
                      Retry
                    </Button>
                  </Box>
                )}
              </Grid>
              <Hidden smDown>
                <Grid item xs={12} md={4}>
                  <Sidebar />
                </Grid>
              </Hidden>
            </Grid>
          </div>
        </Container>
      )}
    </Fragment>
  );
}
