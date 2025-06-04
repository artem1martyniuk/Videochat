const throttle = (func: Function, limit: number) => {
    let inThrottle = false;
    return (...args: any[]) => {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

export default throttle;