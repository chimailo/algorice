import React, { Fragment, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";

import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { makeStyles, Theme, createStyles, Box } from "@material-ui/core";

import CardMenu from "../../components/Menu/CardMenu";
import { PostActions } from ".";
import { Post } from "../../types";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      marginTop: 4,
      padding: theme.spacing(2),
    },
    flexCenter: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    embedLink: {
      display: "flex",
      marginBottom: theme.spacing(1),
      border: `1px solid ${theme.palette.secondary.light}`,
    },
  })
);

export default function PostCard({
  post,
  updateLikes,
}: {
  post: Post;
  updateLikes: (post_id: number) => Promise<void>;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const classes = useStyles();

  const handleMenuClose = () => setAnchorEl(null);

  const handleDropdownClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  return (
    <Fragment>
      <Paper elevation={0} className={classes.paper}>
        <div className={classes.flexCenter}>
          <Typography color="textSecondary" variant="subtitle2">
            {moment(post.created_on).format("MMM YY")}
          </Typography>
          <IconButton
            size="small"
            aria-label="dropdown"
            onClick={handleDropdownClick}
            style={{ marginLeft: 8 }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </div>
        <Typography variant="h6" component="p" paragraph>
          <Link
            underline="none"
            color="inherit"
            to={`/posts/${post.id}`}
            component={RouterLink}
          >
            {post.body}
          </Link>
        </Typography>
        <Link
          underline="none"
          to={`/${post.author.username}/profile`}
          component={RouterLink}
          className={classes.flexCenter}
        >
          <Avatar
            aria-label="recipe"
            src={post.author.profile.avatar}
            alt={post.author.profile.name}
          />
          <div style={{ marginLeft: 8 }}>
            <Typography color="textPrimary" variant="subtitle1" noWrap>
              {post.author.profile.name}
            </Typography>
            <Typography color="textPrimary" variant="subtitle2" noWrap>
              {`@${post.author.username}`}
            </Typography>
          </div>
        </Link>
        <PostActions post={post} updateLikes={updateLikes} />
      </Paper>
      <CardMenu
        anchorEl={anchorEl}
        handleClose={handleMenuClose}
        author={{ id: post.author.id, username: post.author.username }}
      />
    </Fragment>
  );
}

// const EmbedPost = ({ post }: { post: Post }) => {
//   const classes = useStyles();

//   return (
//     <Link
//       underline="none"
//       to={`/posts/${post.id}`}
//       component={RouterLink}
//       className={classes.embedLink}
//     >
//       <Avatar
//         aria-label="recipe"
//         src={post.author.profile.avatar}
//         alt={post.author.profile.name}
//         style={{ width: 24, height: 24 }}
//       />
//       <div className={classes.content}>
//         <div className={classes.meta}>
//           <div className={classes.nameText}>
//             <Typography
//               color="textPrimary"
//               variant="subtitle2"
//               component="h6"
//               noWrap
//             >
//               {post.author.profile.name}
//               <span
//                 className={classes.username}
//               >{`@${post.author.username}`}</span>
//               <span className={classes.postDate}>
//                 {moment(post.created_on).format("MMM YY")}
//               </span>
//             </Typography>
//           </div>
//         </div>
//         <Typography color="textPrimary" variant="body2" component="p">
//           {post.body}
//         </Typography>
//       </div>
//     </Link>
//   );
// };
