import React, { useState } from "react";
import { useSelector } from "react-redux";
import Avatar from "@material-ui/core/Avatar";
import Box from "@material-ui/core/Box";
import Drawer from "@material-ui/core/Drawer";
import FormControl from "@material-ui/core/FormControl";
import Hidden from "@material-ui/core/Hidden";
import IconButton from "@material-ui/core/IconButton";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles, Theme, createStyles } from "@material-ui/core";

import SideMenu from "../../components/Menu/SideMenu";
import { RootState } from "../../rootReducer";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    toolbar: {
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      padding: theme.spacing(0, 1),
      backgroundColor: theme.palette.background.paper,
    },
    drawer: {
      width: 240,
    },
    avatar: {
      flexGrow: 0,
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    menu: {
      top: 0,
      left: 0,
      width: 100,
      position: "fixed",
      textAlign: "center",
      height: "100%",
      overflowX: "hidden",
      padding: theme.spacing(0, 2),
      backgroundColor: theme.palette.background.paper,
      [theme.breakpoints.up("lg")]: {
        width: 240,
      },
    },
    userName: {
      lineHeight: "1.4",
      fontWeight: theme.typography.fontWeightBold,
    },
  })
);

type HeaderProps = {
  title: string | null;
  meta?: string;
  feed?: string;
  handleFeedChange?: (event: React.ChangeEvent<{ value: unknown }>) => void;
};

export default function Header(props: HeaderProps) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isSelectOpen, setSelectOpen] = useState(false);

  const classes = useStyles();
  const { user } = useSelector((state: RootState) => state.auth);

  const { title, meta, feed, handleFeedChange } = props;

  const toggleDrawer = (open: boolean) => (
    event: React.KeyboardEvent | React.MouseEvent
  ) => {
    if (
      event.type === "keydown" &&
      ((event as React.KeyboardEvent).key === "Tab" ||
        (event as React.KeyboardEvent).key === "Shift")
    ) {
      return;
    }

    setDrawerOpen(open);
  };

  return (
    <Toolbar classes={{ root: classes.toolbar }} disableGutters>
      <Hidden smUp>
        <IconButton size="small" aria-label="menu" onClick={toggleDrawer(true)}>
          <Avatar
            alt={user ? user.profile.avatar : undefined}
            src={user ? user.profile.avatar : undefined}
            className={classes.avatar}
          />
        </IconButton>
        <Hidden smUp>
          <Drawer
            anchor="left"
            open={isDrawerOpen}
            onClose={toggleDrawer(false)}
            classes={{ paper: classes.drawer }}
          >
            <SideMenu />
          </Drawer>
        </Hidden>
      </Hidden>
      <Box ml={2} style={{ flexGrow: 1 }}>
        <Typography
          variant="subtitle1"
          component="h6"
          className={classes.userName}
          noWrap
        >
          {title && title.charAt(0).toUpperCase() + title.slice(1)}
        </Typography>
        {meta && (
          <Typography
            variant="body2"
            color="textSecondary"
            noWrap
            style={{ fontSize: 14 }}
          >
            {meta}
          </Typography>
        )}
      </Box>
      {title && title.toLowerCase() === "home" && (
        <FormControl>
          <Select
            disableUnderline
            open={isSelectOpen}
            value={feed}
            onChange={handleFeedChange}
            onClose={() => setSelectOpen(false)}
            onOpen={() => setSelectOpen(true)}
          >
            <MenuItem value={"latest"}>latest</MenuItem>
            <MenuItem value={"top"}>top</MenuItem>
          </Select>
        </FormControl>
      )}
    </Toolbar>
  );
}
