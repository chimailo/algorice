import React, {
  Fragment,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import Typography from "@material-ui/core/Typography";
import ReplayIcon from "@material-ui/icons/Replay";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";

import Header from "../../components/Main/Header";
import ProfileCard from "../../components/Cards/ProfileCard";
import PostCard from "../../components/Cards/PostCard";
import Sidebar from "../../components/Sidebar";
import SideMenu from "../../components/Menu/SideMenu";
import { ProfileError } from "../../components/Loading/LoadingError";
import ProfileTab from "../../components/Tabs/ProfileTab";
import setAuthToken from "../../utils/axiosConfig";
import { getProfile, getUserLikes } from "../../slices/user";
import { Post } from "../../types";
import { RootState } from "../../rootReducer";

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
  })
);

export default function PostTab() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [hasError, setError] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNext, setNext] = useState(false);

  const classes = useStyles();
  const { username } = useParams();
  const scrollRef = useRef(null);

  const dispatch = useDispatch();
  const { user, hasError: error, loading } = useSelector(
    (state: RootState) => state.user
  );

  const getUserPosts = async (username: string, page: number) => {
    setLoading(true);
    localStorage.token && setAuthToken(localStorage.token);

    try {
      const response = await axios.get(`/users/${username}/posts/page/${page}`);

      setPosts([...posts, ...response.data.posts]);
      setNext(response.data.hasNext);
    } catch (error) {
      setError(true);
    }
    setLoading(false);
  };

  const updateLike = async (post_id: number) => {
    localStorage.token && setAuthToken(localStorage.token);

    try {
      const response = await axios.post(`/posts/${post_id}/likes`);

      setPosts(
        posts.map((post) =>
          post.id === response.data.id
            ? { ...post, likes: response.data.likes }
            : post
        )
      );
      dispatch(getUserLikes());
    } catch (error) {
      setError(true);
    }
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
    getUserPosts(username, page);
  }, [username, page]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollObserver(scrollRef.current);
    }
  }, [scrollObserver]);

  return (
    <Fragment>
      {error ? (
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
                <Header title={user.profile.name} />
                <ProfileCard user={user} />
                <ProfileTab username={user?.username} />
                {posts.map((post, index) => {
                  if (posts.length - 1 === index) {
                    return (
                      <article ref={scrollRef} key={post.id}>
                        <PostCard post={post} updateLikes={updateLike} />
                      </article>
                    );
                  } else {
                    return (
                      <article key={post.id}>
                        <PostCard post={post} updateLikes={updateLike} />
                      </article>
                    );
                  }
                })}
                {loading && <CircularProgress />}
                {hasError && (
                  <Box mt={4} style={{ textAlign: "center" }}>
                    <Typography>An error occured</Typography>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<ReplayIcon />}
                      onClick={() => dispatch(getUserPosts(username, page))}
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
