import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import Avatar from "@material-ui/core/Avatar";
import Divider from "@material-ui/core/Divider";
import Link from "@material-ui/core/Link";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Typography from "@material-ui/core/Typography";
import PersonOutlineIcon from "@material-ui/icons/PersonOutline";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";

import { RootState } from "../../rootReducer";
import { logout } from "../../slices/auth";

type MenuProps = {
  anchorEl: null | HTMLElement;
  handleClose: () => void;
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    menuPaper: {
      minWidth: "240px",
    },
    menuDivider: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    menuItem: {
      minHeight: "32px",
    },
    avatar: {
      marginRight: theme.spacing(1),
    },
    profile: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      padding: theme.spacing(0, 2),
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

const UserMenu: React.FC<MenuProps> = ({ anchorEl, handleClose }) => {
  const classes = useStyles();

  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
  };

  return (
    <div>
      <Menu
        id="user-menu"
        classes={{ paper: classes.menuPaper }}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        keepMounted
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <div className={classes.profile}>
          <Avatar
            alt={`${user && user.profile.name}`}
            src={user ? user.profile.avatar : undefined}
            className={classes.avatar}
          />
          <div>
            <Typography variant="subtitle1">
              {`${user && user.profile.name}`}
            </Typography>
            <Typography variant="subtitle2">
              {user && "@" + user.username}
            </Typography>
          </div>
        </div>
        <Divider className={classes.menuDivider} />
        <MenuItem onClick={handleClose} classes={{ root: classes.menuItem }}>
          <Link
            color="inherit"
            underline="none"
            component={RouterLink}
            className={classes.link}
            to={`/${user && user.username}/profile`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <PersonOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </Link>
        </MenuItem>
        <MenuItem onClick={handleClose} classes={{ root: classes.menuItem }}>
          <Link
            color="inherit"
            underline="none"
            component={RouterLink}
            className={classes.link}
            to={`/${user && user.username}/settings`}
          >
            <ListItemIcon className={classes.listItemIcon}>
              <SettingsOutlinedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </Link>
        </MenuItem>
        <Divider className={classes.menuDivider} />
        <MenuItem onClick={handleLogout} classes={{ root: classes.menuItem }}>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
};

export default UserMenu;
