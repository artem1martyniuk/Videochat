import {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import type {RootState} from "../redux/store.ts";

const useDisplayMedia = (toggleDisplayScreen: any) => {
    const displayScreen = useSelector((state: RootState) => state.callReducer.displayScreen);
    const prevDisplayScreenRef = useRef<boolean>(displayScreen);
    const isFirstRender = useRef<boolean>(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            if (displayScreen) {
                toggleDisplayScreen(true);
            }
            prevDisplayScreenRef.current = displayScreen;
            return;
        }

        if (displayScreen !== prevDisplayScreenRef.current) {
            toggleDisplayScreen(displayScreen);
            prevDisplayScreenRef.current = displayScreen;
        }
    }, [displayScreen, toggleDisplayScreen]);
}

export default useDisplayMedia;