import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Home, Room, Error404} from './Pages/index.ts';
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary.tsx";
import SignUp from "./Pages/SignUp/SignUp.tsx";
import SignIn from "./Pages/SignIn/SignIn.tsx";
import {useEffect} from "react";
import {authMe} from "./redux/reducers/user_reducer.ts";
import {useDispatch} from "react-redux";
import {AppDispatch} from "./redux/store.ts";
import ProtectedRoutes from "./utils/ProtectedRoutes.tsx";
import VerifyEmail from "./Pages/VerifyEmail/VerifyEmail.tsx";
import ResetPasswordCheckEmail from "./Pages/ResetPasswordCheckEmail/ResetPasswordCheckEmail.tsx";
import ResetPassword from "./Pages/ResetPassword/ResetPassword.tsx";

function App() {
    const dispatch = useDispatch<AppDispatch>();

    useEffect(() => {
        dispatch(authMe());
    }, [])

    return (
        <>
            <BrowserRouter>
                <ErrorBoundary>
                    <Routes>
                        <Route path="/" element={<Home/>} />
                        <Route path="/rooms/:roomId" element={<Room/>} />
                        <Route path="/signup" element={<SignUp/>} />
                        <Route path="/signin" element={<SignIn/>} />
                        <Route path="/resetPasswordCheckEmail" element={<ResetPasswordCheckEmail/>}/>
                        <Route path="/reset_password/:token" element={<ResetPassword/>}/>
                        <Route path="*" element={<Error404/>}/>

                        <Route element={<ProtectedRoutes/>}>
                            <Route path="/verify_email" element={<VerifyEmail />}/>
                        </Route>
                    </Routes>
                </ErrorBoundary>
            </BrowserRouter>
        </>
    )
}

export default App
