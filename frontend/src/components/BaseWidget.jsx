// src/components/BaseWidget.jsx

import React, { useState, useEffect } from 'react';
import { useWidget } from '../hooks/useWidgets';
import './BaseWidget.css';

/**
 * Base widget component that provides common functionality
 * All other widgets should extend or use this as a wrapper
 */
const BaseWidget = ({
                        widgetId,
                        title,
                        icon,
                        children,
                        className = '',
                        size = 'medium',
                        refreshable = true,
                        settings = null,
                        onSettingsChange = null,
                        headerActions = null
                    }) => {
    const {
        widget,
        updateSettings,
        refresh,
        isRefreshing,
        lastError,
        gridClass
    } = useWidget(widgetId);

    const [showSettings, setShowSettings] = useState(false);
    const [showError, setShowError] = useState(false);

    // Handle settings modal
    const handleSettingsClick = () => {
        setShowSettings(true);
    };

    const handleSettingsClose = () => {
        setShowSettings(false);
    };

    const handleSettingsSave = (newSettings) => {
        if (onSettingsChange) {
            onSettingsChange(newSettings);
        }
        updateSettings(newSettings);
        setShowSettings(false);
    };

    // Handle error display
    useEffect(() => {
        if (lastError) {
            setShowError(true);
            const timer = setTimeout(() => setShowError(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [lastError]);

    // Handle refresh
    const handleRefresh = () => {
        if (refreshable && !isRefreshing) {
            refresh();
        }
    };

    if (!widget || !widget.enabled) {
        return null;
    }

    return (
        <div className={`base-widget ${gridClass} ${className} ${isRefreshing ? 'refreshing' : ''}`}>
            {/* Error Banner */}
            {showError && lastError && (
                <div className="widget-error-banner">
                    <span className="error-icon">⚠️</span>
                    <span className="error-message">{lastError}</span>
                    <button
                        className="error-close"
                        onClick={() => setShowError(false)}
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Widget Header */}
            <div className="widget-header">
                <div className="widget-title-section">
                    {icon && <span className="widget-icon">{icon}</span>}
                    <h3 className="widget-title">{title}</h3>
                </div>

                <div className="widget-controls">
                    {headerActions}

                    {refreshable && (
                        <button
                            className={`control-btn refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            title="Refresh widget"
                        >
                            🔄
                        </button>
                    )}

                    {settings && (
                        <button
                            className="control-btn settings-btn"
                            onClick={handleSettingsClick}
                            title="Widget settings"
                        >
                            ⚙️
                        </button>
                    )}
                </div>
            </div>

            {/* Widget Content */}
            <div className="widget-content">
                {children}
            </div>

            {/* Loading Overlay */}
            {isRefreshing && (
                <div className="widget-loading-overlay">
                    <div className="loading-spinner"></div>
                </div>
            )}

            {/* Settings Modal */}
            {showSettings && settings && (
                <WidgetSettingsModal
                    title={`${title} Settings`}
                    settings={settings}
                    currentValues={widget.settings || {}}
                    onSave={handleSettingsSave}
                    onClose={handleSettingsClose}
                />
            )}
        </div>
    );
};

/**
 * Widget Settings Modal Component
 */
const WidgetSettingsModal = ({
                                 title,
                                 settings,
                                 currentValues,
                                 onSave,
                                 onClose
                             }) => {
    const [formValues, setFormValues] = useState(currentValues);

    const handleInputChange = (key, value) => {
        setFormValues(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formValues);
    };

    const renderSettingInput = (setting) => {
        const value = formValues[setting.key] ?? setting.defaultValue;

        switch (setting.type) {
            case 'toggle':
                return (
                    <label className="setting-toggle">
                        <input
                            type="checkbox"
                            checked={value}
                            onChange={(e) => handleInputChange(setting.key, e.target.checked)}
                        />
                        <span className="toggle-slider"></span>
                    </label>
                );

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleInputChange(setting.key, e.target.value)}
                        className="setting-select"
                    >
                        {setting.options.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value}
                        min={setting.min}
                        max={setting.max}
                        step={setting.step || 1}
                        onChange={(e) => handleInputChange(setting.key, parseFloat(e.target.value))}
                        className="setting-number"
                    />
                );

            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        placeholder={setting.placeholder}
                        onChange={(e) => handleInputChange(setting.key, e.target.value)}
                        className="setting-text"
                    />
                );

            case 'color':
                return (
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => handleInputChange(setting.key, e.target.value)}
                        className="setting-color"
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="widget-settings-modal">
            <div className="modal-backdrop" onClick={onClose}></div>
            <div className="modal-content">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="settings-form">
                    <div className="settings-list">
                        {settings.map(setting => (
                            <div key={setting.key} className="setting-item">
                                <div className="setting-label">
                                    <label>{setting.label}</label>
                                    {setting.description && (
                                        <span className="setting-description">{setting.description}</span>
                                    )}
                                </div>
                                <div className="setting-input">
                                    {renderSettingInput(setting)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Save Settings
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BaseWidget;