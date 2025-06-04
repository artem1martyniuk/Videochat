import React from 'react';
import {Button, Form, Input, Spin} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store.ts";
import {useNavigate} from "react-router-dom";
import useClearState from "../../hooks/useClearState.ts";
import {LoadingOutlined} from "@ant-design/icons";
import {checkEmail} from "../../redux/reducers/user_reducer.ts";
import Center from "../../Components/Center/Center.tsx";
import styles from "./ResetPasswordCheckEmail.module.css";
import {MdAlternateEmail} from "react-icons/md";
import ErrorAlert from "../../Components/ErrorAlert/ErrorAlert.tsx";

const fontSize = 28

function ResetPasswordCheckEmail() {
    const [form] = Form.useForm();
    const {isLoading, error} = useSelector((state: RootState) => state.userReducer);
    const dispatch: AppDispatch = useDispatch();
    const navigate = useNavigate();
    useClearState();

    const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: fontSize}} spin/>}/>;

    const onFinish = (value: {email: string}) => {
        dispatch(checkEmail({email: value.email, navigate}));
    };

    return (
        <Center>
            <h1 style={{marginBottom: '15px', fontSize: 2 * fontSize}}>Enter your email</h1>
            <Form
                form={form}
                name="ResetPasswordCheckEmail"
                initialValues={{remember: true}}
                className={styles.form}
                onFinish={onFinish}
            >
                <Form.Item
                    name="email"
                    rules={[{required: true, message: 'Please input your email!'},
                        { type: 'email', message: 'Wrong email format!' }]}
                >
                    <Input prefix={<MdAlternateEmail/>} placeholder="Email" style={{fontSize: fontSize}}/>
                </Form.Item>

                <Form.Item>
                    <Button block type="primary" htmlType="submit" style={{fontSize: fontSize, height: 50}}>
                        {!isLoading ? 'Send email' : spinner}
                    </Button>
                </Form.Item>
            </Form>

            <ErrorAlert error={error} />
        </Center>
    );
}


export default ResetPasswordCheckEmail;