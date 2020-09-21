import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Typography from '@material-ui/core/Typography';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import * as ROUTES from './utils/routes';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    link: {
      color: theme.palette.background.paper,
      backgroundColor: theme.palette.primary.main,
      padding: '4px 16px',
      borderRadius: 24,
    },
  })
);

export default function Logo() {
  const classes = useStyles();

  return (
    <Typography component='h1' variant='h6' className={classes.wrapper}>
      <Link
        underline='none'
        component={RouterLink}
        to={ROUTES.HOME}
        className={classes.link}
      >
        witti
      </Link>
    </Typography>
  );
}
