import React, { Component, ReactNode } from 'react';
import UnpredictableError from "../../Pages/UnpredictableError/UnpredictableError.tsx";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
    constructor(props: { children: ReactNode }) {
        super(props);
        this.state = { hasError: false };
        this.resetError = this.resetError.bind(this);
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("Caught an error:", error, info);
    }

    resetError() {
        this.setState({ hasError: false });
    }

    render() {
        if (this.state.hasError) {
            return <UnpredictableError resetError={this.resetError} />
        }
        return this.props.children;
    }
}

export default ErrorBoundary;