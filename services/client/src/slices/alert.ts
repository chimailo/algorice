import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Alert } from "../types";

export type AlertState = {
  isOpen: boolean;
  alert: Alert | null;
};

const initialState: AlertState = {
  isOpen: false,
  alert: null,
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    setAlert(state, { payload }: PayloadAction<Alert>) {
      state.isOpen = true;
      state.alert = payload;
    },
    removeAlert(state) {
      state.isOpen = false;
      state.alert = null;
    },
  },
});

export const { setAlert, removeAlert } = alertSlice.actions;

export default alertSlice.reducer;
