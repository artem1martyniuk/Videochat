import {useEffect, useState} from "react";
import {Button, Modal} from "antd";
import {useDispatch, useSelector} from "react-redux";
import {toggleParticipantsModal} from "../../redux/reducers/modal_window_reducer.ts";
import type {RootState} from "../../redux/store.ts";
import {userDTO} from "../../hooks/Mediasoup/types";

interface Props {
    getUsers: () => Promise<userDTO[]>
}

function ParticipantsModal(props: Props) {
    const [users, setUsers] = useState<userDTO[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const dispatch = useDispatch();
    const {isParticipantsModalOpen} = useSelector((state: RootState) => state.modalReducer)

    useEffect(() => {
        async function _getUsers() {
            try{
                setLoading(true);
                const users = await props.getUsers()
                setUsers(users)
            } catch(e) {
                console.log(e)
                setError('Can not get users');
            } finally {
                setLoading(false);
            }
        }

        _getUsers()
            .then(() => {
                console.log("Users successfully received")
            })
    }, [props])

    return (
        <>
            <Modal
                title={loading ? <p>Loading participants</p> : <p>Participants</p>}
                footer={<></>}
                loading={loading}
                open={isParticipantsModalOpen}
                onCancel={() => dispatch(toggleParticipantsModal())}
            >
                {
                    error ?
                        <span>{error}</span> :
                    users && users.map(user => {
                        return <p key={user.id}>{user.userName}</p>
                    })
                }
            </Modal>
        </>
    );
}

export default ParticipantsModal;