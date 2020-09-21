import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import axios from "axios";
import Home from "../../pages/Home";
import Explore from "../../pages/Explore";
import Notifications from "../../pages/Notifications";
import Messages from "../../pages/Messages";
import Landing from "../../pages/Landing";
import Login from "../../pages/Login";
import Followers from "../../pages/Profile/Followers";
import Following from "../../pages/Profile/Following";
import LikesTab from "../../pages/Profile/Likes";
import PostTab from "../../pages/Profile/Posts";
import RepliesTab from "../../pages/Profile/Replies";
import Signup from "../../pages/Signup";
import Terms from "../../pages/Terms";

import PrivateRoute from "../../utils/PrivateRoute";
import setAuthToken from "../../utils/axiosConfig";
import * as ROUTES from "../../utils/routes";
import { RootState } from "../../rootReducer";
import { getAuthUser } from "../../slices/auth";
import { getUserLikes, getAllFollowing } from "../../slices/user";

(function () {
  axios.defaults.baseURL = process.env.REACT_APP_API_URL;
  axios.defaults.headers.post["Content-Type"] = "application/json";
})();

export default function App() {
  const dispatch = useDispatch();

  localStorage.token && setAuthToken(localStorage.token);

  const { user } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    dispatch(getAuthUser());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllFollowing());
    dispatch(getUserLikes());
  }, [dispatch]);

  return (
    <div style={{ overflow: "hidden" }}>
      <Router>
        <Switch>
          <Route exact path={ROUTES.LANDING}>
            <Landing />
          </Route>
          <Route exact path={ROUTES.SIGNUP}>
            <Signup />
          </Route>
          <Route exact path={ROUTES.LOGIN}>
            <Login />
          </Route>
          <Route exact path={ROUTES.TERMS}>
            <Terms />
          </Route>
          <PrivateRoute exact path={ROUTES.HOME}>
            <Home />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.EXPLORE}>
            <Explore />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.NOTIFICATIONS}>
            <Notifications />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.MESSAGES}>
            <Messages />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.FOLLOWERS}>
            <Followers />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.FOLLOWING}>
            <Following />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.REPLIES}>
            <RepliesTab />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.LIKES}>
            <LikesTab />
          </PrivateRoute>
          <PrivateRoute exact path={ROUTES.PROFILE}>
            <PostTab />
          </PrivateRoute>
        </Switch>
      </Router>
    </div>
  );
}
