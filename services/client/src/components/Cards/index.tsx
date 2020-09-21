import React, { useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useSelector } from "react-redux";

import IconButton from "@material-ui/core/IconButton";
import FavoriteBorderOutlinedIcon from "@material-ui/icons/FavoriteBorderOutlined";
import FavoriteIcon from "@material-ui/icons/Favorite";
import FavoriteOutlinedIcon from "@material-ui/icons/FavoriteOutlined";
import Link from "@material-ui/core/Link";
import Typography from "@material-ui/core/Typography";
import { makeStyles, createStyles } from "@material-ui/core";
import { RootState } from "../../rootReducer";

import { Post } from "../../types";

const useStyles = makeStyles(() =>
  createStyles({
    actions: {
      display: "flex",
      alignItems: "center",
    },
  })
);

export const PostActions = ({
  post,
  updateLikes,
}: {
  post: Post;
  updateLikes: (post_id: number) => Promise<void>;
}) => {
  const classes = useStyles();
  const { likes } = useSelector((state: RootState) => state.user);

  const isLiked = (id: number) => likes.some((post) => post.id === id);

  return (
    <section className={classes.actions}>
      <IconButton
        aria-label="add to favorites"
        size="small"
        onClick={() => updateLikes(post.id)}
      >
        <Typography variant="body2" style={{ marginRight: 4 }}>
          {post.likes.length}{" "}
        </Typography>
        {isLiked(post.id) ? (
          <FavoriteOutlinedIcon color="primary" />
        ) : (
          <FavoriteBorderOutlinedIcon fontSize="small" />
        )}
      </IconButton>
      <Typography variant="body2">
        <Link
          color="textSecondary"
          to={`/posts/${post.id}`}
          component={RouterLink}
          style={{ marginLeft: 8 }}
        >
          {post.comments.length} comments
        </Link>
      </Typography>
    </section>
  );
};
