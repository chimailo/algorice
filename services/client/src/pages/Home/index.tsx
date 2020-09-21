import React, { Fragment, useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";
import Hidden from "@material-ui/core/Hidden";
import { makeStyles, Theme, createStyles } from "@material-ui/core";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Main/Header";
import SideMenu from "../../components/Menu/SideMenu";
// import PostCard from "../../components/Cards/PostCard";
// import { RootState } from "../../rootReducer";

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

export default function Home() {
  const [feedType, setFeedType] = useState("latest");

  const classes = useStyles();
  // const { posts } = useSelector((state: RootState) => state.posts);
  // const dispatch = useDispatch();

  const handleFeedChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFeedType(event.target.value as string);
  };

  useEffect(() => {
    console.log(feedType);
    // dispatch(getPostFeed(feedType))
  }, [feedType]);

  return (
    <Fragment>
      <Container maxWidth="xl" disableGutters>
        <Hidden xsDown>
          <SideMenu />
        </Hidden>
        <div className={classes.main}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={8}>
              <Header
                title="home"
                feed={feedType}
                handleFeedChange={handleFeedChange}
              />
              {/* {posts.map((post) => (
                <PostCard postItem={post} />
              ))} */}
            </Grid>
            <Hidden smDown>
              <Grid item xs={12} md={4}>
                <Sidebar />
              </Grid>
            </Hidden>
          </Grid>
        </div>
      </Container>
    </Fragment>
  );
}
