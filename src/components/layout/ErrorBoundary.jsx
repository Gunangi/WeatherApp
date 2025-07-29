import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Log error to console for development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // In production, you might want to log this to an error reporting service
        if (process.env.NODE_ENV === 'production') {
            // Example: Sentry.captureException(error, { extra: errorInfo });
        }
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleReportError = () => {
        const errorReport = {
            error: this.state.error?.toString(),
            stack: this.state.error?.stack,
            componentStack: this.state.errorInfo?.componentStack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            retryCount: this.state.retryCount
        };

        const subject = encodeURIComponent('WeatherApp Error Report');
        const body = encodeURIComponent(
            `Error Report:\n\n${JSON.stringify(errorReport, null, 2)}\n\nPlease describe what you were doing when this error occurred:`
        );

        window.open(`mailto:support@weatherapp.com?subject=${subject}&body=${body}`);
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        {/* Error Icon */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                                <AlertTriangle size={40} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                We encountered an unexpected error. Don't worry, our team has been notified.
                            </p>
                        </div>

                        {/* Error Details (Development Mode) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                                <h3 className="font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                                    <Bug size={16} />
                                    Error Details (Development Mode)
                                </h3>
                                <div className="text-sm text-red-700 dark:text-red-300 space-y-2">
                                    <div>
                                        <strong>Error:</strong> {this.state.error.toString()}
                                    </div>
                                    {this.state.errorInfo?.componentStack && (
                                        <div>
                                            <strong>Component Stack:</strong>
                                            <pre className="mt-1 text-xs bg-red-100 dark:bg-red-900/20 p-2 rounded overflow-x-auto">
                        {this.state.errorInfo.componentStack}
                      </pre>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Retry Information */}
                        {this.state.retryCount > 0 && (
                            <div className="mb-6 p-3 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                                    Retry attempts: {this.state.retryCount}
                                </p>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={this.handleRetry}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                            >
                                <RefreshCw size={18} />
                                Try Again
                            </button>

                            <button
                                onClick={this.handleGoHome}
                                className="w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors font-medium"
                            >
                                <Home size={18} />
                                Go to Home
                            </button>

                            <button
                                onClick={this.handleReportError}
                                className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 px-4 py-3 rounded-lg transition-colors font-medium"
                            >
                                <Mail size={18} />
                                Report This Error
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="mt-8 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                If the problem persists, try refreshing the page or clearing your browser cache.
                            </p>
                        </div>

                        {/* Debug Info */}
                        {process.env.NODE_ENV === 'development' && (
                            <details className="mt-6">
                                <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                                    Show technical details
                                </summary>
                                <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-xs">
                                    <div className="space-y-2">
                                        <div>
                                            <strong>Timestamp:</strong> {new Date().toISOString()}
                                        </div>
                                        <div>
                                            <strong>User Agent:</strong> {navigator.userAgent}
                                        </div>
                                        <div>
                                            <strong>URL:</strong> {window.location.href}
                                        </div>
                                        {this.state.error?.stack && (
                                            <div>
                                                <strong>Stack Trace:</strong>
                                                <pre className="mt-1 bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto">
                          {this.state.error.stack}
                        </pre>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;