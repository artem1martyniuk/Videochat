const Center = ({ children }) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
            height: '100vh',
            width: '100vw',
        }}>
            {children}
        </div>
    );
};

export default Center;