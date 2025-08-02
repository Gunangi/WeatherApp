// src/hooks/useWidgets.js

import { useState, useEffect, useCallback, useContext } from 'react';
import { UserContext } from '../context/UserContext';
import {
    DEFAULT_WIDGETS,
    saveWidgetConfig,
    loadWidgetConfig,
    generateRefreshSchedule
} from '../utils/widgetUtils';

/**
 * Custom hook for managing widget state and configuration
 */
export const useWidgets = () => {
    const { userPreferences, updateUserPreferences } = useContext(UserContext);
    const [widgets, setWidgets] = useState(DEFAULT_WIDGETS);
    const [refreshSchedule, setRefreshSchedule] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initialize widgets from user preferences or localStorage
    useEffect(() => {
        const initializeWidgets = async () => {
            try {
                setIsLoading(true);

                let widgetConfig;

                // Try to get from user preferences first
                if (userPreferences?.widgets) {
                    widgetConfig = userPreferences.widgets;
                } else {
                    // Fallback to localStorage
                    widgetConfig = loadWidgetConfig();
                }

                setWidgets(widgetConfig);
                setRefreshSchedule(generateRefreshSchedule(widgetConfig));
                setError(null);
            } catch (err) {
                console.error('Failed to initialize widgets:', err);
                setError('Failed to load widget configuration');
                setWidgets(DEFAULT_WIDGETS);
            } finally {
                setIsLoading(false);
            }
        };

        initializeWidgets();
    }, [userPreferences]);

    // Save widget configuration
    const saveWidgets = useCallback(async (newWidgets) => {
        try {
            // Save to localStorage immediately
            saveWidgetConfig(newWidgets);

            // Update user preferences if context is available
            if (updateUserPreferences) {
                await updateUserPreferences({
                    ...userPreferences,
                    widgets: newWidgets
                });
            }

            setWidgets(newWidgets);
            setRefreshSchedule(generateRefreshSchedule(newWidgets));
            setError(null);
        } catch (err) {
            console.error('Failed to save widgets:', err);
            setError('Failed to save widget configuration');
        }
    }, [userPreferences, updateUserPreferences]);

    // Toggle widget enabled state
    const toggleWidget = useCallback((widgetId) => {
        const newWidgets = widgets.map(widget =>
            widget.id === widgetId
                ? { ...widget, enabled: !widget.enabled }
                : widget
        );
        saveWidgets(newWidgets);
    }, [widgets, saveWidgets]);

    // Move widget position
    const moveWidget = useCallback((widgetId, direction) => {
        const currentIndex = widgets.findIndex(w => w.id === widgetId);
        const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (newIndex < 0 || newIndex >= widgets.length) return;

        const newWidgets = [...widgets];
        [newWidgets[currentIndex], newWidgets[newIndex]] = [newWidgets[newIndex], newWidgets[currentIndex]];

        // Update positions
        const updatedWidgets = newWidgets.map((widget, index) => ({
            ...widget,
            position: index
        }));

        saveWidgets(updatedWidgets);
    }, [widgets, saveWidgets]);

    // Reorder widgets
    const reorderWidgets = useCallback((sourceIndex, destinationIndex) => {
        const newWidgets = Array.from(widgets);
        const [reorderedWidget] = newWidgets.splice(sourceIndex, 1);
        newWidgets.splice(destinationIndex, 0, reorderedWidget);

        // Update positions
        const updatedWidgets = newWidgets.map((widget, index) => ({
            ...widget,
            position: index
        }));

        saveWidgets(updatedWidgets);
    }, [widgets, saveWidgets]);

    // Update widget settings
    const updateWidgetSettings = useCallback((widgetId, settings) => {
        const newWidgets = widgets.map(widget =>
            widget.id === widgetId
                ? { ...widget, ...settings }
                : widget
        );
        saveWidgets(newWidgets);
    }, [widgets, saveWidgets]);

    // Reset widgets to default
    const resetWidgets = useCallback(() => {
        saveWidgets(DEFAULT_WIDGETS);
    }, [saveWidgets]);

    // Get enabled widgets sorted by position
    const getEnabledWidgets = useCallback(() => {
        return widgets
            .filter(widget => widget.enabled)
            .sort((a, b) => a.position - b.position);
    }, [widgets]);

    // Get widget by ID
    const getWidget = useCallback((widgetId) => {
        return widgets.find(widget => widget.id === widgetId);
    }, [widgets]);

    // Check if widget needs refresh
    const shouldRefreshWidget = useCallback((widgetId) => {
        const schedule = refreshSchedule[widgetId];
        if (!schedule) return false;

        return Date.now() >= schedule.nextRefresh;
    }, [refreshSchedule]);

    // Update widget refresh time
    const updateWidgetRefreshTime = useCallback((widgetId) => {
        const widget = getWidget(widgetId);
        if (!widget || !widget.refreshInterval) return;

        setRefreshSchedule(prev => ({
            ...prev,
            [widgetId]: {
                ...prev[widgetId],
                lastRefresh: Date.now(),
                nextRefresh: Date.now() + widget.refreshInterval
            }
        }));
    }, [getWidget]);

    // Get widgets that need refresh
    const getWidgetsNeedingRefresh = useCallback(() => {
        return getEnabledWidgets().filter(widget => shouldRefreshWidget(widget.id));
    }, [getEnabledWidgets, shouldRefreshWidget]);

    // Widget size configurations
    const getWidgetSize = useCallback((widgetId) => {
        const widget = getWidget(widgetId);
        if (!widget) return 'medium';

        const sizeMap = {
            'current-weather': 'large',
            'hourly': 'large',
            'forecast': 'medium',
            'metrics': 'medium',
            'air-quality': 'medium',
            'clothing': 'medium',
            'activities': 'medium',
            'uv-index': 'small',
            'sun-times': 'small'
        };

        return widget.size || sizeMap[widgetId] || 'medium';
    }, [getWidget]);

    // Get widget grid class
    const getWidgetGridClass = useCallback((widgetId) => {
        const size = getWidgetSize(widgetId);

        switch (size) {
            case 'large':
                return 'widget-large';
            case 'small':
                return 'widget-small';
            default:
                return 'widget-medium';
        }
    }, [getWidgetSize]);

    // Export widget configuration
    const exportWidgetConfig = useCallback(() => {
        const config = {
            widgets,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };

        const blob = new Blob([JSON.stringify(config, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weather-widgets-config-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, [widgets]);

    // Import widget configuration
    const importWidgetConfig = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);

                    // Validate configuration structure
                    if (!config.widgets || !Array.isArray(config.widgets)) {
                        throw new Error('Invalid configuration format');
                    }

                    // Merge with default widgets to ensure all widgets are present
                    const mergedWidgets = DEFAULT_WIDGETS.map(defaultWidget => {
                        const importedWidget = config.widgets.find(w => w.id === defaultWidget.id);
                        return importedWidget ? { ...defaultWidget, ...importedWidget } : defaultWidget;
                    });

                    saveWidgets(mergedWidgets);
                    resolve(mergedWidgets);
                } catch (err) {
                    console.error('Failed to import widget configuration:', err);
                    reject(new Error('Invalid configuration file'));
                }
            };

            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };

            reader.readAsText(file);
        });
    }, [saveWidgets]);

    // Widget analytics
    const getWidgetAnalytics = useCallback(() => {
        const enabledCount = widgets.filter(w => w.enabled).length;
        const totalCount = widgets.length;
        const mostUsedSize = widgets.reduce((acc, widget) => {
            const size = getWidgetSize(widget.id);
            acc[size] = (acc[size] || 0) + (widget.enabled ? 1 : 0);
            return acc;
        }, {});

        return {
            enabled: enabledCount,
            total: totalCount,
            enabledPercentage: Math.round((enabledCount / totalCount) * 100),
            sizeDistribution: mostUsedSize,
            lastModified: refreshSchedule.lastModified || Date.now()
        };
    }, [widgets, getWidgetSize, refreshSchedule]);

    // Widget validation
    const validateWidgets = useCallback(() => {
        const errors = [];

        widgets.forEach(widget => {
            if (!widget.id) {
                errors.push('Widget missing ID');
            }
            if (!widget.name) {
                errors.push(`Widget ${widget.id} missing name`);
            }
            if (typeof widget.enabled !== 'boolean') {
                errors.push(`Widget ${widget.id} has invalid enabled state`);
            }
            if (typeof widget.position !== 'number') {
                errors.push(`Widget ${widget.id} has invalid position`);
            }
        });

        // Check for duplicate positions
        const positions = widgets.map(w => w.position);
        const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
        if (duplicatePositions.length > 0) {
            errors.push('Duplicate widget positions found');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, [widgets]);

    // Auto-save functionality
    useEffect(() => {
        const autoSaveInterval = setInterval(() => {
            if (widgets && widgets.length > 0) {
                saveWidgetConfig(widgets);
            }
        }, 30000); // Auto-save every 30 seconds

        return () => clearInterval(autoSaveInterval);
    }, [widgets]);

    // Refresh timer management
    useEffect(() => {
        const refreshInterval = setInterval(() => {
            const widgetsNeedingRefresh = getWidgetsNeedingRefresh();
            if (widgetsNeedingRefresh.length > 0) {
                // Trigger refresh event for widgets that need it
                widgetsNeedingRefresh.forEach(widget => {
                    const event = new CustomEvent('widgetRefresh', {
                        detail: { widgetId: widget.id }
                    });
                    window.dispatchEvent(event);
                });
            }
        }, 60000); // Check every minute

        return () => clearInterval(refreshInterval);
    }, [getWidgetsNeedingRefresh]);

    return {
        // State
        widgets,
        refreshSchedule,
        isLoading,
        error,

        // Actions
        toggleWidget,
        moveWidget,
        reorderWidgets,
        updateWidgetSettings,
        resetWidgets,
        saveWidgets,

        // Getters
        getEnabledWidgets,
        getWidget,
        getWidgetSize,
        getWidgetGridClass,

        // Refresh management
        shouldRefreshWidget,
        updateWidgetRefreshTime,
        getWidgetsNeedingRefresh,

        // Import/Export
        exportWidgetConfig,
        importWidgetConfig,

        // Analytics & Validation
        getWidgetAnalytics,
        validateWidgets
    };
};

/**
 * Hook for individual widget state management
 */
export const useWidget = (widgetId) => {
    const {
        getWidget,
        updateWidgetSettings,
        shouldRefreshWidget,
        updateWidgetRefreshTime,
        getWidgetSize,
        getWidgetGridClass
    } = useWidgets();

    const widget = getWidget(widgetId);
    const [localState, setLocalState] = useState({});
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastError, setLastError] = useState(null);

    // Update widget-specific settings
    const updateSettings = useCallback((settings) => {
        updateWidgetSettings(widgetId, settings);
    }, [widgetId, updateWidgetSettings]);

    // Handle widget refresh
    const refresh = useCallback(async () => {
        if (isRefreshing) return;

        try {
            setIsRefreshing(true);
            setLastError(null);

            // Trigger refresh event
            const event = new CustomEvent('widgetRefresh', {
                detail: { widgetId }
            });
            window.dispatchEvent(event);

            updateWidgetRefreshTime(widgetId);
        } catch (error) {
            console.error(`Failed to refresh widget ${widgetId}:`, error);
            setLastError(error.message);
        } finally {
            setIsRefreshing(false);
        }
    }, [widgetId, isRefreshing, updateWidgetRefreshTime]);

    // Auto-refresh based on schedule
    useEffect(() => {
        if (shouldRefreshWidget(widgetId)) {
            refresh();
        }
    }, [widgetId, shouldRefreshWidget, refresh]);

    return {
        widget,
        localState,
        setLocalState,
        updateSettings,
        refresh,
        isRefreshing,
        lastError,
        size: getWidgetSize(widgetId),
        gridClass: getWidgetGridClass(widgetId),
        needsRefresh: shouldRefreshWidget(widgetId)
    };
};

export default useWidgets;