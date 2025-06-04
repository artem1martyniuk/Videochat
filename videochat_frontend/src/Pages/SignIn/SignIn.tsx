import React from 'react';
import {Alert, Button, Form, Input, Spin} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store.ts";
import {Link, useNavigate} from "react-router-dom";
import {LoadingOutlined} from "@ant-design/icons";
import {signIn} from "../../redux/reducers/user_reducer.ts";
import Center from "../../Components/Center/Center.tsx";
import styles from "./SignIn.module.css";
import {MdAlternateEmail, MdLockOutline} from "react-icons/md";
import ErrorAlert from "../../Components/ErrorAlert/ErrorAlert.tsx";
import useClearState from "../../hooks/useClearState.ts";

interface User {
    email: string,
    password: string
}

const fontSize = 28

function SignIn() {
    const [form] = Form.useForm();
    const {isLoading, error} = useSelector((state: RootState) => state.userReducer);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    useClearState();

    const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: fontSize}} spin/>}/>;

    const onFinish = (values: User) => {
        dispatch(signIn({user: values, navigate}));
    };

    return (
        <Center>
            <h1 style={{marginBottom: '15px', fontSize: 2 * fontSize}}>Sign In</h1>
            <Form
                form={form}
                name="SignIn"
                initialValues={{remember: true}}
                className={styles.form}
                onFinish={onFinish}
            >
                <Form.Item
                    name="email"
                    rules={[{required: true, message: 'Please input your email!'},
                        {type: 'email', message: 'Wrong email format!'}]}
                >
                    <Input prefix={<MdAlternateEmail/>} placeholder="Email" style={{fontSize: fontSize}}/>
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        {required: true, message: 'Please input your Password!'},
                        () => ({
                            validator(_, value) {
                                if (!value || (value.length >= 6 && value.length <= 12)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Password must be at least 6 characters and no more than 12'));
                            },
                        }),
                    ]}
                >
                    <Input prefix={<MdLockOutline/>} type="password" placeholder="Password"
                           style={{fontSize: fontSize}}/>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" style={{fontSize: fontSize, height: 50}}>
                        {!isLoading ? 'Sign in' : spinner}
                    </Button>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 8}}>
                        <span style={{fontSize: fontSize / 1.5}}>
                          or <Link to="/signup">Sign up now!</Link>
                        </span>

                        <span style={{fontSize: fontSize / 1.5}}>
                          <Link to="/">Main page</Link>
                        </span>

                        <Link style={{fontSize: fontSize / 1.5}} to="/resetPasswordCheckEmail">
                            Forgot Password
                        </Link>
                    </div>
                </Form.Item>
            </Form>

            <ErrorAlert error={error}/>
        </Center>
    );
}

export default SignIn;