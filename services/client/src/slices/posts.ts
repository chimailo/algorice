import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

import setAuthToken from "../utils/axiosConfig";
import { AppThunk } from "../store";
import { setAlert } from "./alert";
import { Post } from "../types";

export type PostState = {
  posts: Post[];
  hasNext: boolean;
  post: Post | null;
  loading: boolean;
  hasError: boolean;
};

const initialState: PostState = {
  loading: true,
  hasError: false,
  hasNext: false,
  posts: [],
  post: null,
};

const postSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    getPostsSuccess(
      state,
      { payload }: PayloadAction<{ posts: Post[]; hasNext: boolean }>
    ) {
      state.loading = false;
      state.hasNext = payload.hasNext;
      state.posts = [...state.posts, ...payload.posts];
    },
    getPostSuccess(state, { payload }: PayloadAction<Post>) {
      state.loading = false;
      state.post = payload;
    },
    addPostSuccess(state, { payload }: PayloadAction<Post>) {
      state.posts = [payload, ...state.posts];
      state.loading = false;
    },
    editPostSuccess(state, { payload }: PayloadAction<Post>) {
      state.posts = state.posts.map((post) =>
        post.id === payload.id ? { ...post, body: payload.body } : post
      );
      state.loading = false;
    },
    deletePostSuccess(state, { payload }: PayloadAction<number>) {
      state.posts = state.posts.filter((post) => post.id !== payload);
      state.loading = false;
    },
    updateLikesSuccess(state, { payload }: PayloadAction<Post>) {
      state.posts = state.posts.map((post) =>
        post.id === payload.id ? { ...post, likes: payload.likes } : post
      );
      state.loading = false;
    },
    getError(state) {
      state.loading = false;
      state.hasError = true;
    },
  },
});

export const {
  getPostsSuccess,
  getPostSuccess,
  deletePostSuccess,
  editPostSuccess,
  addPostSuccess,
  updateLikesSuccess,
  getError,
} = postSlice.actions;

export default postSlice.reducer;

export const getHomeFeed = (page: number, feed: string): AppThunk => async (
  dispatch
) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.get(`/posts/${feed}/page/${page}`);

    dispatch(getPostsSuccess(response.data));
  } catch (error) {
    dispatch(getError());
  }
};

export const getPost = (id: number): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.get(`/posts/${id}`);
    console.log(response.data);

    dispatch(getPostSuccess(response.data));
  } catch (error) {
    dispatch(getError());
  }
};

export const addPost = (
  post_id: number,
  post: string,
  edit = false
): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    let response;

    if (edit) {
      response = await axios.put(`/posts/${post_id}`, {
        post,
      });
      dispatch(editPostSuccess(response.data));
      setAlert({ message: "Successfully updated post", severity: "success" });
    } else {
      response = await axios.post(`/posts`, {
        post,
      });
      dispatch(addPostSuccess(response.data));
      setAlert({ message: "Successfully added post", severity: "success" });
    }
  } catch (error) {
    dispatch(getError());
  }
};

export const deletePost = (post_id: number): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.delete(`/posts/${post_id}`);

    dispatch(deletePostSuccess(response.data));
  } catch (error) {
    dispatch(getError());
  }
};

export const updatePostLike = (post_id: number): AppThunk => async (
  dispatch
) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.delete(`/posts/${post_id}/likes`);

    dispatch(updateLikesSuccess(response.data));
  } catch (error) {
    dispatch(getError());
    setAlert({
      message: `An error occured, please try again.`,
      severity: "error",
      duration: 6000,
    });
  }
};
