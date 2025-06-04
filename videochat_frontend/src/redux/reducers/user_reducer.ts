import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import axiosInstance from '../../config/otherConfig/axios'
import {NavigateFunction} from "react-router-dom";

interface UserSignUp {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    confirmPassword: string
}

interface UserSignIn {
    email: string,
    password: string
}

interface UserState {
    userData: {
        firstName: string,
        lastName: string,
        isActive: boolean
    } | null,
    authMeLoading: boolean,
    isLoading: boolean,
    error: any
}

export const signUp = createAsyncThunk<any, { user: UserSignUp, navigate: NavigateFunction }, { rejectValue: any }>(
    'users/signUp',
    async ({user, navigate}, {rejectWithValue}) => {
        const {firstName, lastName, email, password, confirmPassword} = user;
        let response;

        try {
           response = await axiosInstance.post(`/signup`, {
                firstName,
                lastName,
                email,
                password,
                confirmPassword
            })

            navigate('/',
                {
                state: {
                    msg: 'User successfully created'
                }
            });
        }catch(error: any) {
            console.log(error?.response);
            return rejectWithValue(error?.response.data);
        }

        return response.data;
    },
)

export const signIn = createAsyncThunk<any, { user: UserSignIn, navigate: NavigateFunction }, { rejectValue: any }>(
    'users/signIn',
    async ({user, navigate}, {rejectWithValue}) => {
        const {email, password} = user;
        let response;

        try {
            response = await axiosInstance.post(`/signin`, {
                email,
                password
            })

            navigate('/',
                {
                    state: {
                        msg: 'User successfully logged in'
                    }
                });
        }catch(error: any) {
            console.log(error?.response);
            return rejectWithValue(error?.response.data);
        }

        return response.data;
    },
)

export const authMe = createAsyncThunk(
    'users/authMe',
    async () => {
        let response;

        try {
            response = await axiosInstance.get(`/auth_me`)
        }catch(error: any) {
            console.log(error?.response);
            return;
        }

        return response.data;
    },
)

export const logOut = createAsyncThunk<any, {navigate: NavigateFunction}>(
    'users/logout',
    async ({navigate}, thunkAPI) => {
        await axiosInstance.post(`/logout`)

        thunkAPI.dispatch(logOut_())

        navigate('/', {state: {msg: 'User successfully logged out'}})
    }
)

export const sendEmail = createAsyncThunk<any, {navigate: NavigateFunction}> (
    'users/sendEmail',
    async ({navigate}, {rejectWithValue}) => {
        try {
            await axiosInstance.post(`/email_confirmation/gen_token`)

            navigate('/verify_email');
        } catch(error: any) {
            console.log(error?.response || error);
            return rejectWithValue(error?.response.data);
        }
    }
)

export const checkEmail = createAsyncThunk<any, {email: string, navigate: NavigateFunction}> (
    'users/checkEmail',
    async ({email, navigate}, {rejectWithValue}) => {
        try {
            await axiosInstance.post(`/reset_password_send_email`, {email})

            navigate("/", { state: {msg: 'Email to reset password was sent successfully'}});
        } catch(error: any) {
            console.log(error?.response || error);
            return rejectWithValue(error?.response.data);
        }
    }
)

export const resetPassword = createAsyncThunk<any, {passwords: {password: string, confirmPassword: string}, token: string, navigate: NavigateFunction}> (
    'users/resetPassword',
    async ({passwords, token, navigate}, {rejectWithValue}) => {
        try {
            await axiosInstance.post(`/reset_password_confirmation`, {
                token,
                password: passwords.password,
                confirmPassword: passwords.confirmPassword
            })

            navigate("/", { state: {msg: 'Password was reset successfully'}});
        } catch(error: any) {
            console.log(error?.response || error);
            return rejectWithValue(error?.response.data);
        }
    }
)

export const verifyEmail = createAsyncThunk<any, { code: string, navigate: NavigateFunction }, { rejectValue: any }>(
    'users/verifyEmail',
    async ({code, navigate}, {rejectWithValue}) => {
        let response;

        try {
            response = await axiosInstance.post(`/email_confirmation/confirm_email`, {
                code
            })

            navigate('/',
                {
                    state: {
                        msg: 'Email successfully verified'
                    }
                });
        }catch(error: any) {
            console.log(error?.response);
            return rejectWithValue(error?.response.data);
        }

        return response.data;
    },
)

const initialState: UserState = {
    userData: null,
    authMeLoading: false,
    isLoading: false,
    error: null
}

function onUserRejected(state: UserState, action: PayloadAction<any>) {
    state.isLoading = false;
    if(action.payload?.errors) {
        state.error = action.payload.errors;
    }else if(action.payload?.error) {
        state.error = action.payload.error;
    }
}

export const authSlice = createSlice({
    name: "authorization",
    initialState,
    reducers: {
        clearState: (state) => {
          state.isLoading = false;
          state.error = null;
        },
        logOut_: (state) => {
            state.userData = null;
        }
    },
    extraReducers: (builder) => {
        builder.addCase(signUp.pending, (state, action) => {
            state.error = null;
            state.isLoading = true;
        })
        builder.addCase(signUp.rejected, (state, action) => {
            onUserRejected(state, action);
        })
        builder.addCase(signUp.fulfilled, (state, action) => {
            state.userData = action.payload.userData;
            state.isLoading = false;
            state.error = null;
        })

        builder.addCase(signIn.pending, (state, action) => {
            state.error = null;
            state.isLoading = true;
        })
        builder.addCase(signIn.rejected, (state, action) => {
            onUserRejected(state, action);
        })
        builder.addCase(signIn.fulfilled, (state, action) => {
            state.userData = action.payload.userData;
            state.isLoading = false;
            state.error = null;
        })

        builder.addCase(authMe.rejected, (state, action) => {
            state.error = null;
            state.authMeLoading = true;
        })
        builder.addCase(authMe.pending, (state, action) => {
            state.error = null;
            state.authMeLoading = true;
        })
        builder.addCase(authMe.fulfilled, (state, action) => {
            state.error = null;
            state.authMeLoading = false;
            state.userData = action.payload?.userData || null;
        })

        builder.addCase(verifyEmail.pending, (state, action) => {
            state.error = null;
            state.isLoading = true;
        })
        builder.addCase(verifyEmail.rejected, (state, action) => {
            onUserRejected(state, action);
        })
        builder.addCase(verifyEmail.fulfilled, (state, action) => {
            if(state.userData?.firstName && state.userData.lastName) {
                state.userData = {firstName: state.userData.firstName, lastName: state.userData.lastName, isActive: true};
            }
            state.isLoading = false;
            state.error = null;
        })

        builder.addCase(sendEmail.rejected, (state, action) => {
            onUserRejected(state, action);
        })
        builder.addCase(sendEmail.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
        })
        builder.addCase(sendEmail.pending, (state, action) => {
            state.error = null;
            state.isLoading = true;
        })
        builder.addCase(checkEmail.pending, (state, action) => {
            state.error = null;
            state.isLoading = true;
        })
        builder.addCase(checkEmail.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
        })
        builder.addCase(checkEmail.rejected, (state, action) => {
            onUserRejected(state, action);
        })
        builder.addCase(resetPassword.pending, (state, action) => {
            state.error = null;
            state.isLoading = true;
        })
        builder.addCase(resetPassword.fulfilled, (state, action) => {
            state.isLoading = false;
            state.error = null;
        })
        builder.addCase(resetPassword.rejected, (state, action) => {
            onUserRejected(state, action);
        })
    }
})

export const { clearState, logOut_ } = authSlice.actions;

export default authSlice.reducer