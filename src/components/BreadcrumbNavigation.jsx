import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const BreadcrumbNavigation = ({ customPath = null }) => {
    const location = useLocation();
    const { theme } = useTheme();

    // Route mapping for breadcrumb labels
    const routeLabels = {
        '/': 'Dashboard',
        '/map': 'Weather Map',
        '/comparison': 'City Comparison',
        '/journal': 'Weather Journal',
        '/alerts': 'Weather Alerts',
        '/history': 'Weather History',
        '/profile': 'User Profile',
        '/notifications': 'Notifications',
        '/settings': 'Settings',
        '/cities': 'Multiple Cities',
        '/widgets': 'Weather Widgets',
        '/travel': 'Travel Weather',
        '/events': 'Event Planning'
    };

    // Generate breadcrumb path
    const generateBreadcrumbs = () => {
        if (customPath) {
            return customPath;
        }

        const pathnames = location.pathname.split('/').filter(x => x);

        if (pathnames.length === 0) {
            return [{ path: '/', label: 'Dashboard', isLast: true }];
        }

        const breadcrumbs = [
            { path: '/', label: 'Dashboard', isLast: false }
        ];

        let currentPath = '';
        pathnames.forEach((name, index) => {
            currentPath += `/${name}`;
            const isLast = index === pathnames.length - 1;

            breadcrumbs.push({
                path: currentPath,
                label: routeLabels[currentPath] || name.charAt(0).toUpperCase() + name.slice(1),
                isLast
            });
        });

        return breadcrumbs;
    };

    const breadcrumbs = generateBreadcrumbs();

    return (
        <nav className={`
      flex items-center space-x-2 px-6 py-4 text-sm
      ${theme === 'dark'
            ? 'text-gray-300 bg-gray-800/50'
            : 'text-gray-600 bg-gray-50/50'
        }
      backdrop-blur-sm border-b
      ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}
    `}>
            <Home className="w-4 h-4" />

            {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                    {index > 0 && (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}

                    {crumb.isLast ? (
                        <span className={`
              font-medium
              ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
            `}>
              {crumb.label}
            </span>
                    ) : (
                        <Link
                            to={crumb.path}
                            className={`
                hover:underline transition-colors duration-200
                ${theme === 'dark'
                                ? 'text-blue-400 hover:text-blue-300'
                                : 'text-blue-600 hover:text-blue-800'
                            }
              `}
                        >
                            {crumb.label}
                        </Link>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default BreadcrumbNavigation;