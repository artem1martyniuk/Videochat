import React, {useEffect, useRef, useState} from 'react';
import {Flex, Button, Alert, Spin} from "antd";
import bg from '../../assets/bg2.png'
import styles from './Home.module.css'
import {useLocation, useNavigate} from "react-router-dom";
import {v4} from 'uuid';
import {logOut, sendEmail} from "../../redux/reducers/user_reducer.ts";
import {JoiningModal} from "../../Components/JoiningModal/JoiningModal.tsx";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch, RootState} from "../../redux/store.ts";
import {LoadingOutlined} from "@ant-design/icons";

function Home() {
    const [isModalOpened, setIsModalOpened] = useState<boolean>(false);
    const isCreate = useRef(false);
    const roomId = useRef<string>("");
    const {userData, isLoading} = useSelector((state: RootState) => state.userReducer);
    const dispatch: AppDispatch = useDispatch();

    const navigate = useNavigate();
    const {state: afterOperationState} = useLocation();

    const logout_ = () => {
        dispatch(logOut({navigate}))
    }

    const vefifyEmail = () => {
        dispatch(sendEmail({navigate}))
    }

    useEffect(() => {
        if (afterOperationState?.msg) {
            const timer = setTimeout(() => {
                navigate(location.pathname, {replace: true}); // cleaning location state
            }, 2000);
            return () => clearTimeout(timer);
        }
        if(afterOperationState?.error) {
            const timer = setTimeout(() => {
                navigate(location.pathname, {replace: true}); // cleaning location state
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [afterOperationState]);

    const createRoom = () => {
        isCreate.current = true;
        roomId.current = v4();

        if(userData) {
            joinRoom(roomId.current, `${userData.firstName} ${userData.lastName}`, isCreate.current);
            return;
        }

        setIsModalOpened(true)
    }

    const onJoinButtonClick = () => {
        isCreate.current = false;
        setIsModalOpened(true)
    }

    const joinRoom = (id: string | undefined, name: string, isCreate: boolean) => {
        navigate(`/rooms/${id}`, {state: {userName: name, isCreate}});
    }

    const onCloseModal = () => {
        setIsModalOpened(false)

        roomId.current = "";
    }

    const spinner = <Spin indicator={<LoadingOutlined style={{fontSize: 28}} spin/>}/>;

    return (
        <div className={styles.main_container}>
            <img src={bg} className={styles.bg_image} alt='Background image'/>
            <div className={styles.right_side}>
                <div className={styles.text}>
                    <div className={styles.title}>
                        <span className={styles.title}>Welcome to our</span><br />
                        <span className={styles.title}>meeting platform</span>
                    </div>
                    <div className={styles.sub_title}>Join a room to connect with your team instantly</div>
                </div>
                {afterOperationState?.msg && (
                    <Alert message={afterOperationState.msg} type="success" className={styles.alert}/>
                )}
                {afterOperationState?.error && (
                    <Alert message={afterOperationState.error} type="error" className={styles.alert}/>
                )}
                {userData?.isActive &&
                        <Button type='primary' className={styles.button} onClick={createRoom}>Create room</Button>}
                <Button type='primary' className={styles.button} onClick={onJoinButtonClick}>Join room</Button>
                {/*{userData &&*/}
                {/*    <Button type='primary' className={styles.button} onClick={changeUserInfo}>Edit info</Button>*/}
                {/*}*/}

                    <div className={styles.auth_container}>
                        {!userData &&
                            <>
                                <Button type='primary' className={styles.button} style={{height: "40%", width: '15%'}} onClick={() => navigate('signin')}>Sign In</Button>
                                <Button type='primary' className={styles.button} style={{height: "40%", width: '15%'}} onClick={() => navigate('signup')}>Sign Up</Button>
                            </>
                        }
                        {userData &&
                            <Button type='primary' className={styles.button} style={{height: "40%", width: '15%'}} onClick={logout_}>Log out</Button>
                        }
                    </div>

                {userData && !userData.isActive &&
                    <div className={styles.verify_container}>
                        <Alert message='To create conferences please verify your email' type="info" className={styles.alert_verify}/>
                        <Button type='primary' disabled={isLoading} style={{height: '80%', width: "20%"}} onClick={vefifyEmail}>{ !isLoading ? "Verify" : spinner}</Button>
                    </div>
                }
            </div>

            {isModalOpened &&
                <JoiningModal
                    roomId={roomId.current}
                    join={joinRoom}
                    close={onCloseModal}
                    userName={userData ? `${userData.firstName} ${userData.lastName}` : 'default'}
                    isCreate={isCreate.current}>
            </JoiningModal>}
        </div>
    );
}

export default Home;