import React from "react";
import { useSelector } from "react-redux";
import axios from "axios";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FlagOutlinedIcon from "@material-ui/icons/FlagOutlined";
import PersonAddOutlinedIcon from "@material-ui/icons/PersonAddOutlined";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import { RootState } from "../../rootReducer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuPaper: {
      minWidth: "220px",
      padding: theme.spacing(1),
    },
    menuDivider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    menuItem: {
      minHeight: "32px",
    },
    menuProfile: {
      textAlign: "center",
      lineHeight: 1.2,
      color: theme.palette.text.secondary,
    },
    link: {
      display: "flex",
      width: "100%",
      justifyContent: "center",
      alignContent: "center",
    },
    listItemIcon: {
      color: "inherit",
      minWidth: 0,
      alignItems: "center",
      marginRight: theme.spacing(2),
    },
  })
);

type MenuProps = {
  author: { id: number; username: string };
  anchorEl: null | HTMLElement;
  handleClose: () => void;
};

export default function CardMenu({ anchorEl, handleClose, author }: MenuProps) {
  const classes = useStyles();

  const { following } = useSelector((state: RootState) => state.user);

  const isFollowing = async (id: number) => following.some((f) => f.id === id);

  return (
    <div>
      <Menu
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        getContentAnchorEl={null}
        classes={{ paper: classes.menuPaper }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={handleClose} classes={{ root: classes.menuItem }}>
          <ListItemIcon className={classes.listItemIcon}>
            <PersonAddOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={`${isFollowing(author.id) ? "unfollow" : "follow"} @${
              author.username
            }`}
            primaryTypographyProps={{ variant: "subtitle2" }}
          />
        </MenuItem>
        <MenuItem onClick={handleClose} classes={{ root: classes.menuItem }}>
          <ListItemIcon className={classes.listItemIcon}>
            <FlagOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary="Report Post"
            primaryTypographyProps={{ variant: "subtitle2" }}
          />
        </MenuItem>
      </Menu>
    </div>
  );
}
