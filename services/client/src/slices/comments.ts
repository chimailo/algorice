import axios from "axios";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import setAuthToken from "../utils/axiosConfig";
import { Comment } from "../types";
import { setAlert } from "./alert";
import { AppThunk } from "../store";

export type PostState = {
  comments: Comment[];
  hasNext: boolean;
  loading: boolean;
  hasError: boolean;
};

const initialState: PostState = {
  loading: true,
  hasError: false,
  hasNext: false,
  comments: [],
};

const postSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    getCommentsSuccess(
      state,
      { payload }: PayloadAction<{ comments: Comment[]; commentsNext: boolean }>
    ) {
      state.hasNext = payload.commentsNext;
      state.comments = [...state.comments, ...payload.comments];
      state.loading = false;
    },
    addCommentSuccess(state, { payload }: PayloadAction<Comment>) {
      state.comments = [payload, ...state.comments];
      state.loading = false;
    },
    editCommentSuccess(state, { payload }: PayloadAction<Comment>) {
      state.comments = state.comments.map((comment) =>
        comment.id === payload.id ? { ...comment, body: payload.body } : comment
      );
      state.loading = false;
    },
    deleteCommentSuccess(state, { payload }: PayloadAction<number>) {
      state.comments = state.comments.filter(
        (comment) => comment.id !== payload
      );
      state.loading = false;
    },
    updateLikesSuccess(state, { payload }: PayloadAction<Comment>) {
      state.comments = state.comments.map((comment) =>
        comment.id === payload.id
          ? { ...comment, likes: payload.likes }
          : comment
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
  addCommentSuccess,
  deleteCommentSuccess,
  editCommentSuccess,
  getCommentsSuccess,
  updateLikesSuccess,
  getError,
} = postSlice.actions;

export default postSlice.reducer;

export const getPostComments = (id: number, page: number): AppThunk => async (
  dispatch
) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.get(`/posts/${id}/comments/page/${page}`);

    dispatch(getCommentsSuccess(response.data));
  } catch (error) {
    dispatch(getError());
  }
};

export const addComment = (
  post_id: number,
  comment: string,
  edit = false,
  comment_id?: number
): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    if (edit) {
      const response = await axios.put(
        `/posts/${post_id}/comments${comment_id}`,
        {
          post: comment,
        }
      );
      dispatch(editCommentSuccess(response.data));
    } else {
      const response = await axios.post(
        `/posts/${post_id}/comments${comment_id ? "/" + comment_id : ""}`,
        {
          post: comment,
        }
      );
      dispatch(addCommentSuccess(response.data));
    }
  } catch (error) {
    dispatch(getError());
    setAlert({
      message: `An error occured, please try again.`,
      severity: "error",
      duration: 6000,
    });
  }
};

export const deleteComment = (
  post_id: number,
  comment_id: number
): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.delete(
      `/posts/${post_id}/comments/${comment_id}`
    );

    dispatch(deleteCommentSuccess(response.data));
  } catch (error) {
    dispatch(getError());
    setAlert({
      message: `An error occured while deleting comment, please try again.`,
      severity: "error",
      duration: 6000,
    });
  }
};

export const updateCommentLike = (
  post_id: number,
  comment_id: number
): AppThunk => async (dispatch) => {
  localStorage.token && setAuthToken(localStorage.token);

  try {
    const response = await axios.delete(
      `/posts/${post_id}/comments/${comment_id}/likes`
    );

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
