import React from 'react';
import {
  Redirect,
  Link as RouterLink,
  RouteComponentProps,
  withRouter,
} from 'react-router-dom';
import { StaticContext } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Formik } from 'formik';

import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles, createStyles, Theme } from '@material-ui/core';

import * as ROUTES from '../../utils/routes';
import { login } from '../../slices/auth';
import { removeAlert } from '../../slices/alert';
import { RootState } from '../../rootReducer';
import Logo from '../../logo';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    wrapper: {
      height: '100%',
      width: '100%',
      position: 'relative',
      '&:after': {
        content: '""',
        position: 'fixed',
        width: '100%',
        height: '70vh',
        zIndex: -1,
        top: 0,
        transformOrigin: 'left top',
        transform: 'skewY(-15deg)',
        backgroundColor: theme.palette.primary.main,
      },
    },
    paper: {
      width: '100%',
      padding: theme.spacing(3, 5),
      [theme.breakpoints.up('sm')]: {
        maxWidth: '500px',
        boxShadow: theme.shadows[3],
        padding: theme.spacing(5, 10),
        margin: theme.spacing(4, 'auto'),
      },
    },
    field: {
      marginTop: theme.spacing(2),
    },
    button: {
      marginTop: '3rem',
      color: theme.palette.background.paper,
    },
  })
);

function Login(
  props: RouteComponentProps<{}, StaticContext, { from: { pathname: string } }>
) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { isOpen, alert } = useSelector((state: RootState) => state.alert);

  const { from } = props.location.state || { from: { pathname: '/' } };

  if (isAuthenticated) {
    return <Redirect to={from} />;
  }

  const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    dispatch(removeAlert());
  };

  return (
    <div className={classes.wrapper}>
      <Grid
        container
        alignItems='center'
        justify='center'
        style={{ minHeight: '100vh' }}
      >
        <Grid item xs={12} sm={8} md={6} component='main'>
          <Snackbar
            open={isOpen}
            autoHideDuration={alert && alert.duration}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <MuiAlert
              variant='filled'
              onClose={handleClose}
              severity={alert ? alert.severity : undefined}
              elevation={6}
            >
              {alert && alert.message}
            </MuiAlert>
          </Snackbar>
          <Paper color='primary' elevation={0} className={classes.paper}>
            <Logo />
            <Typography
              component='p'
              variant='h6'
              align='center'
              className={classes.field}
              noWrap
            >
              Log in to your account.
            </Typography>
            <Formik
              initialValues={{
                identity: '',
                password: '',
              }}
              onSubmit={async (values) => dispatch(login(values))}
            >
              {({
                values,
                handleChange,
                handleBlur,
                handleSubmit,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit}>
                  <TextField
                    name='identity'
                    label='Email or Username'
                    type='text'
                    className={classes.field}
                    value={values.identity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                  />
                  <TextField
                    name='password'
                    label='Password'
                    type='password'
                    className={classes.field}
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    fullWidth
                  />
                  <Button
                    type='submit'
                    color='primary'
                    variant='contained'
                    className={classes.button}
                    disableElevation
                    fullWidth
                    disabled={isSubmitting}
                  >
                    Login
                  </Button>
                </form>
              )}
            </Formik>
            <Typography
              variant='body2'
              style={{ marginTop: '2rem' }}
              gutterBottom
            >
              Don't have an account?
              <Link component={RouterLink} to={ROUTES.SIGNUP} color='primary'>
                <strong> Sign up here.</strong>
              </Link>
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
}

export default withRouter(Login);
