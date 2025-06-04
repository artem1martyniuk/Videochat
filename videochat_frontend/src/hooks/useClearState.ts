import {useEffect} from "react";
import {clearState} from "../redux/reducers/user_reducer.ts";
import {useDispatch} from "react-redux";

const useClearState = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        return () => {
            dispatch(clearState())
        }
    }, [])
}

export default useClearState