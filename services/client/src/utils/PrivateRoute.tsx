import React from 'react';
import { useSelector } from 'react-redux';
import { Route, Redirect, RouteProps } from 'react-router-dom';

import * as ROUTES from './routes';
import { RootState } from '../rootReducer';

const PrivateRoute: React.FC<RouteProps> = ({ children, ...rest }) => {
  const { isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  return (
    <Route
      {...rest}
      render={(props) => {
        return isAuthenticated && !loading ? (
          children
        ) : (
          <Redirect
            to={{ pathname: ROUTES.LOGIN, state: { from: props.location } }}
          />
        );
      }}
    />
  );
};

export default PrivateRoute;
