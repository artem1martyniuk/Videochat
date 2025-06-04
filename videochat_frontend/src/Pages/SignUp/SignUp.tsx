import {LuUser} from "react-icons/lu";
import styles from './SignUp.module.css'
import {LoadingOutlined} from '@ant-design/icons';
import {
    Alert,
    Button,
    Form,
    Input,
    Spin
} from "antd";
import Center from "../../Components/Center/Center.tsx";
import {MdAlternateEmail, MdLockOutline} from "react-icons/md";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store.ts";
import {clearState, signUp} from "../../redux/reducers/user_reducer.ts";
import {Link, useNavigate} from "react-router-dom";
import ErrorAlert from "../../Components/ErrorAlert/ErrorAlert.tsx";
import React, {useEffect} from "react";
import useClearState from "../../hooks/useClearState.ts";

interface User {
    confirmPassword: string
    email: string
    firstName: string
    lastName: string
    password: string
}

const fontSize = 28

function SignUp() {
    const [form] = Form.useForm();
    const {isLoading, error} = useSelector((state: RootState) => state.userReducer);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    useClearState();

    const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: fontSize}} spin/>}/>;

    const onFinish = (values: User) => {
        dispatch(signUp({user: values, navigate}));
    };

    return (
        <Center>
            <h1 style={{marginBottom: '15px', fontSize: 2 * fontSize}}>Sign Up</h1>
            <Form
                form={form}
                name="SignUp"
                initialValues={{remember: true}}
                className={styles.form}
                onFinish={onFinish}
            >
                <Form.Item
                    name="firstName"
                    rules={[
                        {required: true, message: 'Please input your first name!'},
                        () => ({
                            validator(_, value) {
                                if (!value || (value.length >= 2 && value.length <= 50)) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The firstname must be at least 2 and no more than 50 characters'));
                            },
                        }),
                    ]}
                >
                    <Input prefix={<LuUser/>} placeholder="First name" style={{fontSize: fontSize}}/>
                </Form.Item>

                <Form.Item
                    name="lastName"
                    rules={
                        [
                            {required: true, message: 'Please input your last name!'},
                            () => ({
                                validator(_, value) {
                                    if (!value || (value.length >= 2 && value.length <= 50)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The lastname must be at least 2 and no more than 50'));
                                },
                            }),
                        ]}
                >
                    <Input prefix={<LuUser/>} placeholder="Last name" style={{fontSize: fontSize}}/>
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[{required: true, message: 'Please input your email!'},
                        { type: 'email', message: 'Wrong email format!' }]}
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

                <Form.Item
                    name="confirmPassword"
                    rules={[
                        {required: true, message: 'Please repeat your password!'},
                        ({getFieldValue}) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('The two passwords do not match!'));
                            },
                        }),
                    ]}
                >
                    <Input prefix={<MdLockOutline/>} type="password" placeholder="Confirm Password"
                           style={{fontSize: fontSize}}/>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" style={{fontSize: fontSize, height: 50}}>
                        {!isLoading ? 'Sign up' : spinner}
                    </Button>
                    <span style={{fontSize: fontSize / 1.5}}>or </span>
                    <Link style={{fontSize: fontSize / 1.5}} to="/signin">Sign in now!</Link>
                </Form.Item>
            </Form>

            <ErrorAlert error={error} />
        </Center>
    );
}

export default SignUp;