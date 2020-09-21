import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import { AppThunk } from "../store";
import setAuthToken from "../utils/axiosConfig";
import { LoginParams, SignupParams, User } from "../types";
import { setAlert } from "./alert";
import { clearProfile } from "./user";

export type AuthState = {
  isAuthenticated: boolean;
  loading: boolean;
  token: string | null;
  user: User | null;
};

const initialState: AuthState = {
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authSuccess(state, { payload }: PayloadAction<User>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = payload;
    },
    signinSuccess(state, { payload }: PayloadAction<{ token: string }>) {
      payload.token && localStorage.setItem("token", payload.token);
      state.loading = false;
      state.isAuthenticated = true;
      state.token = payload.token;
    },
    authError(state) {
      localStorage.removeItem("token");
      state.token = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { authSuccess, signinSuccess, authError } = authSlice.actions;

export default authSlice.reducer;

export const getAuthUser = (): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.get("/auth/user");

    dispatch(authSuccess(response.data));
  } catch (error) {
    dispatch(authError());
  }
};

export const signup = (values: SignupParams): AppThunk => async (dispatch) => {
  const { name, username, email, password } = values;

  const body = JSON.stringify({ name, username, email, password });

  try {
    const response = await axios.post("/auth/register", body);

    dispatch(signinSuccess(response.data));
    dispatch(getAuthUser());
  } catch (error) {
    dispatch(authError());
  }
};

export const login = (values: LoginParams): AppThunk => async (dispatch) => {
  const { identity, password } = values;

  const body = JSON.stringify({ identity, password });

  try {
    const response = await axios.post("/auth/login", body);

    dispatch(signinSuccess(response.data));
    dispatch(getAuthUser());
  } catch (error) {
    const message = error.response.data.message;

    dispatch(authError());
    dispatch(setAlert({ message, severity: "error", duration: 8000 }));
  }
};

export const logout = (): AppThunk => async (dispatch) => {
  dispatch(clearProfile());
  dispatch(authError());
};
