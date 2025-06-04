import React, {useRef, useState} from 'react';
import { Button, Modal, Input, Form } from 'antd';
import { validate, version } from 'uuid';

type MyComponentProps = {
    close: () => void;
    join: (id: string, name: string, isCreate: boolean) => void;
    roomId: string;
    userName: string;
    isCreate: boolean;
};

export const JoiningModal =  ({close, join, roomId, userName, isCreate}: MyComponentProps) => {
    const [isModalOpened, setIsModalOpened] = useState<boolean>(true);
    const [form] = Form.useForm();
    const btnref = useRef<HTMLButtonElement>(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            btnref.current.click();
        }
    };

    const closeModal = () => {
        setIsModalOpened(false);
        setTimeout(() => {
            close();
        }, 150)
    }

    const handleJoin = async () => {
        try {
            const values = await form.validateFields();

            const name = userName === 'default' ? values.name : userName;

            if(!roomId) {
                roomId = values.roomId;
            }

            join(roomId, name, isCreate);
            close();
        } catch (error) {
            console.log('Validation failed:', error);
        }
    };

    const isValidId = (id: string) => {
        return validate(id) && version(id) === 4;
    }

    return (
        <div>
            <Modal
                open={isModalOpened}
                onCancel={close}
                footer={[
                    <Button key="back" onClick={closeModal}>
                        Cancel
                    </Button>,
                    <Button ref={btnref} key="submit" type="primary" onClick={handleJoin}>
                        Submit
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    onKeyDown={handleKeyDown}
                    name="dataForm"
                    layout="vertical"
                    initialValues={{remember: true}}
                >
                    {roomId.length === 0 ?
                        <Form.Item
                            label="Enter room id"
                            name="roomId"
                            rules={[
                                { required: true, message: 'Please input conference id!' },
                                () => ({
                                    validator(_, value) {
                                        if (!value || isValidId(value)) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Provided id has a wrong format'));
                                    },
                                }),
                            ]}
                        >
                            <Input />
                        </Form.Item>
                        : null
                    }
                    {userName === 'default' &&
                    <Form.Item
                        label="Enter your name"
                        name="name"
                        rules={[
                            {required: true, message: 'Please input your name'},
                            () => ({
                                validator(_, value) {
                                    if (!value || (value.length > 4 && value.length < 30)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('The name must be at least 5 characters and no more than 30'));
                                },
                            }),
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    }
                </Form>
            </Modal>
        </div>
    );
};