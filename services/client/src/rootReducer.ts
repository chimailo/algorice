import { combineReducers } from "@reduxjs/toolkit";
import alertReducer from "./slices/alert";
import authReducer from "./slices/auth";
// import profileReducer from "./slices/profile";
import postReducer from "./slices/posts";
import userReducer from "./slices/user";

const rootReducer = combineReducers({
  alert: alertReducer,
  auth: authReducer,
  post: postReducer,
  // profile: profileReducer,
  user: userReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
