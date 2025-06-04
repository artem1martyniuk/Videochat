import React from 'react';
import {Button, Form, Input, Spin} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store.ts";
import {Link, useNavigate, useParams} from "react-router-dom";
import useClearState from "../../hooks/useClearState.ts";
import {LoadingOutlined} from "@ant-design/icons";
import {checkEmail, resetPassword} from "../../redux/reducers/user_reducer.ts";
import Center from "../../Components/Center/Center.tsx";
import styles from "../ResetPasswordCheckEmail/ResetPasswordCheckEmail.module.css";
import {MdAlternateEmail, MdLockOutline} from "react-icons/md";
import ErrorAlert from "../../Components/ErrorAlert/ErrorAlert.tsx";

const fontSize = 28;

function ResetPassword(){
    const [form] = Form.useForm();
    const token = useParams().token || ""

    const {isLoading, error} = useSelector((state: RootState) => state.userReducer);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    useClearState();

    const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: fontSize}} spin/>}/>;

    const onFinish = (value: {password: string, confirmPassword: string}) => {
        dispatch(resetPassword({passwords: value, token, navigate}));
    };

    return (
        <Center>
            <h1 style={{marginBottom: '15px', fontSize: 2 * fontSize}}>Reset your password</h1>
            <Form
                form={form}
                name="ResetPassword"
                initialValues={{remember: true}}
                className={styles.form}
                onFinish={onFinish}
            >
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
                        {!isLoading ? 'Reset Password' : spinner}
                    </Button>
                    <Link style={{fontSize: fontSize / 1.5}} to="/">Main page</Link>
                </Form.Item>
            </Form>

            <ErrorAlert error={error} />
        </Center>
    );
}

export default ResetPassword;