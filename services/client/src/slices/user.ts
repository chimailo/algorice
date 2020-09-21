import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import setAuthToken from "../utils/axiosConfig";
import { setAlert } from "./alert";
import { AppThunk } from "../store";
import { Profile, User } from "../types";

type State = {
  profile: Profile | null;
  user: User | null;
  following: { id: number }[];
  likes: { id: number }[];
  loading: boolean;
  hasError: boolean;
};

const initialState: State = {
  loading: true,
  hasError: false,
  profile: null,
  user: null,
  following: [],
  likes: [],
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    getProfileSuccess(state, { payload }: PayloadAction<User>) {
      state.loading = false;
      state.user = payload;
    },
    getFollowingSuccess(state, { payload }: PayloadAction<{ id: number }[]>) {
      state.following = payload;
      state.loading = false;
    },
    getLikesSuccess(state, { payload }: PayloadAction<{ id: number }[]>) {
      state.likes = payload;
      state.loading = false;
    },
    clearProfile(state) {
      state.profile = null;
      state.following = [];
      state.likes = [];
      state.loading = false;
    },
    getError(state) {
      state.loading = false;
      state.hasError = true;
    },
  },
});

export const {
  getProfileSuccess,
  getFollowingSuccess,
  getLikesSuccess,
  clearProfile,
  getError,
} = userSlice.actions;

export default userSlice.reducer;

export const getProfile = (username: string): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.get(`/profile/${username}`);

    dispatch(getProfileSuccess(response.data));
  } catch (error) {
    dispatch(getError());
  }
};

export const updateProfile = (values: Profile): AppThunk => async (
  dispatch
) => {
  localStorage.token && setAuthToken(localStorage.token);

  const { name, dob, bio } = values;
  const user = { name, dob, bio };

  try {
    const response = await axios.put("/profile", user);

    dispatch(getProfileSuccess(response.data));
  } catch (error) {
    const message = error.response.data;

    dispatch(getError());
    dispatch(setAlert({ message, severity: "error", duration: 6000 }));
  }
};

export const deleteProfile = (): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    await axios.delete("/profile");

    dispatch(clearProfile());
    dispatch(getError());
  } catch (error) {
    dispatch(getError());
  }
};

export const follow = (id: number): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.post(`/users/follow/${id}`);

    dispatch(getFollowingSuccess(response.data));
  } catch (error) {
    dispatch(getError());
    setAlert({
      message: `An error occured, please try again.`,
      severity: "error",
      duration: 6000,
    });
  }
};

export const unfollow = (id: number): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.post(`/users/unfollow/${id}`);

    dispatch(getFollowingSuccess(response.data));
  } catch (error) {
    dispatch(getError());
    setAlert({
      message: `An error occured, please try again.`,
      severity: "error",
      duration: 6000,
    });
  }
};

export const getAllFollowing = (): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.get("/users/following");

    dispatch(getFollowingSuccess(response.data));
  } catch (error) {
    dispatch(getError());
    setAlert({
      message: `An error occured, please try again.`,
      severity: "error",
      duration: 6000,
    });
  }
};

export const getUserLikes = (): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.get("/users/likes");

    dispatch(getLikesSuccess(response.data));
  } catch (error) {
    dispatch(getError());
    setAlert({
      message: `An error occured, please try again.`,
      severity: "error",
      duration: 6000,
    });
  }
};

// export const getFollowers = (username?: string): AppThunk => async (dispatch) => {
//   localStorage.token && setAuthToken(localStorage.token);

//   try {
//     const response = await axios.get(`/profile${username && "/" + username}`);

//     dispatch(getProfileSuccess(response.data));
//   } catch (error) {
//     dispatch(getProfileError());
//   }
// };

// export const getFollowing = (username?: string): AppThunk => async (dispatch) => {
//   localStorage.token && setAuthToken(localStorage.token);

//   try {
//     const response = await axios.get(`/profile${username && "/" + username}`);

//     dispatch(getProfileSuccess(response.data));
//   } catch (error) {
//     dispatch(getProfileError());
//   }
// };
