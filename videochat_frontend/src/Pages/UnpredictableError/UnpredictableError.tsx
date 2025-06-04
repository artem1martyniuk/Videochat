import React from 'react';
import { useNavigate } from "react-router-dom";

interface UnpredictableErrorProps {
    resetError: () => void;
}

function UnpredictableError({ resetError }: UnpredictableErrorProps) {
    const navigate = useNavigate();

    const handleNavigateHome = () => {
        resetError();
        navigate('/');
        window.location.reload();
    };

    return (
        <>
            <h1>
                Internal Error
            </h1>
            <button onClick={handleNavigateHome}>Home</button>
        </>
    );
}

export default UnpredictableError;