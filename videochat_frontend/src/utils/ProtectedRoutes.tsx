import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {RootState} from "../redux/store.ts";
import {Spin} from "antd";
import {LoadingOutlined} from "@ant-design/icons";
import React from "react";
import Center from "../Components/Center/Center.tsx";

const ProtectedRoutes = () => {
    const { authMeLoading, userData, error } = useSelector((state: RootState) => state.userReducer);
    const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: 50}} spin/>}/>;

    if (authMeLoading) {
        return (
            <Center>
                {spinner}
            </Center>
        );
    }

    if (userData && authMeLoading === false) {
        return <Outlet />;
    }

    if (!error) {
        return <Navigate to="/signin" />;
    }
};

export default ProtectedRoutes;