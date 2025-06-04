import React, {useEffect} from 'react';
import {Alert, Button, Form, Input, Spin} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store.ts";
import {Link, useNavigate} from "react-router-dom";
import {LoadingOutlined} from "@ant-design/icons";
import {signIn, verifyEmail} from "../../redux/reducers/user_reducer.ts";
import Center from "../../Components/Center/Center.tsx";
import styles from "../SignIn/SignIn.module.css";
import {MdAlternateEmail, MdLockOutline} from "react-icons/md";
import ErrorAlert from "../../Components/ErrorAlert/ErrorAlert.tsx";
import useClearState from "../../hooks/useClearState.ts";

const fontSize = 28

interface VerificationCode {
    verificationCode: string;
}

function VerifyEmail() {
    const [form] = Form.useForm();
    const {isLoading, error} = useSelector((state: RootState) => state.userReducer);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    useClearState();

    const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: fontSize}} spin/>}/>;

    const onFinish = (values: VerificationCode) => {
        console.log(values);
        dispatch(verifyEmail({code: values.verificationCode, navigate}));
    };

    return (
        <Center>
            <h1 style={{marginBottom: '15px', fontSize: 2 * fontSize}}>Email verification</h1>
            <Form
                form={form}
                name="VerifyEmail"
                initialValues={{remember: true}}
                className={styles.form}
                onFinish={onFinish}
            >
                <Form.Item
                    name="verificationCode"
                    rules={[
                        {required: true, message: 'Please input code!'},
                        () => ({
                            validator(_, value) {
                                if(!value || (value.length === 6 && Number(value))) {
                                    return Promise.resolve();
                                }

                                return Promise.reject(new Error('Code must contain six digits'));
                            }
                        })
                    ]}
                >
                    <Input prefix={<MdLockOutline/>} type="text" placeholder="Verification code"
                           style={{fontSize: fontSize}}/>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" style={{fontSize: fontSize, height: 50}}>
                        {!isLoading ? 'Verify' : spinner}
                    </Button>
                </Form.Item>
            </Form>

            <ErrorAlert error={error} />
        </Center>
    );
}

export default VerifyEmail;