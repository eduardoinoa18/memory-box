import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KpiCard({ 
    title, 
    value, 
    change, 
    changeType = 'neutral', 
    icon: Icon, 
    loading = false,
    subtitle,
    color = 'blue'
}) {
    const getChangeIcon = () => {
        switch (changeType) {
            case 'increase':
                return <TrendingUp className="w-4 h-4 text-green-600" />;
            case 'decrease':
                return <TrendingDown className="w-4 h-4 text-red-600" />;
            default:
                return <Minus className="w-4 h-4 text-gray-400" />;
        }
    };

    const getChangeColor = () => {
        switch (changeType) {
            case 'increase':
                return 'text-green-600';
            case 'decrease':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

    const colorClasses = {
        blue: 'bg-blue-500',
        green: 'bg-green-500',
        purple: 'bg-purple-500',
        orange: 'bg-orange-500',
        red: 'bg-red-500',
        gray: 'bg-gray-500'
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                {Icon && (
                    <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="w-4 h-4 text-white" />
                    </div>
                )}
            </div>
            
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
                    )}
                </div>
                
                {change !== undefined && (
                    <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
                        {getChangeIcon()}
                        <span className="text-sm font-medium">
                            {Math.abs(change)}%
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
