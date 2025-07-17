import { useEffect, useState } from "react";
// TODO: Re-enable Firebase when ready
// import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
// import { db } from "../../config/firebase";
import { Calendar, Activity } from "lucide-react";

export default function Heatmap() {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);

    useEffect(() => {
        fetchActivityData();
    }, []);

    const fetchActivityData = async () => {
        try {
            setLoading(true);
            
            // Mock data for demo - replace with Firebase queries when ready
            const activityByDay = {};
            const today = new Date();
            
            // Generate mock activity data for the last 30 days
            for (let i = 0; i < 30; i++) {
                const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
                const dayKey = date.toISOString().split('T')[0];
                const randomActivity = Math.floor(Math.random() * 50) + 1;
                const randomUsers = Math.floor(Math.random() * 20) + 1;
                
                activityByDay[dayKey] = {
                    count: randomActivity,
                    users: new Set(Array.from({length: randomUsers}, (_, i) => `user_${i}`)),
                    date: date
                };
            }

            // Convert Set to count
            Object.keys(activityByDay).forEach(day => {
                activityByDay[day].userCount = activityByDay[day].users.size;
                delete activityByDay[day].users; // Remove Set object
            });
            
            setData(activityByDay);
        } catch (error) {
            console.error("Error fetching activity data:", error);
        } finally {
            setLoading(false);
        }
    };

    const generateDayGrid = () => {
        const days = [];
        const today = new Date();
        
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dayKey = date.toISOString().split('T')[0];
            const dayData = data[dayKey] || { count: 0, userCount: 0, date };
            
            days.push({
                date: dayKey,
                displayDate: date,
                count: dayData.count,
                userCount: dayData.userCount,
                intensity: Math.min(dayData.count / 10, 1) // Normalize to 0-1
            });
        }
        
        return days;
    };

    const getIntensityColor = (intensity) => {
        if (intensity === 0) return 'bg-gray-100';
        if (intensity < 0.2) return 'bg-blue-200';
        if (intensity < 0.4) return 'bg-blue-300';
        if (intensity < 0.6) return 'bg-blue-400';
        if (intensity < 0.8) return 'bg-blue-500';
        return 'bg-blue-600';
    };

    const getDayName = (date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    };

    const getMonthName = (date) => {
        return date.toLocaleDateString('en-US', { month: 'short' });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-blue-600" />
                        Activity Heatmap
                    </h3>
                </div>
                <div className="animate-pulse">
                    <div className="grid grid-cols-10 gap-1">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="w-6 h-6 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const days = generateDayGrid();
    const maxCount = Math.max(...days.map(d => d.count));
    const totalActivity = days.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-blue-600" />
                    Activity Heatmap (Last 30 Days)
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{totalActivity} total uploads</span>
                    <span>Peak: {maxCount} uploads/day</span>
                </div>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-4">
                {/* Month labels */}
                <div className="grid grid-cols-10 gap-1 text-xs text-gray-500">
                    {days.map((day, index) => {
                        const isFirstOfMonth = day.displayDate.getDate() === 1 || index === 0;
                        return (
                            <div key={`month-${index}`} className="text-center">
                                {isFirstOfMonth ? getMonthName(day.displayDate) : ''}
                            </div>
                        );
                    })}
                </div>

                {/* Main grid */}
                <div className="grid grid-cols-10 gap-1">
                    {days.map((day, index) => (
                        <div
                            key={day.date}
                            className={`w-6 h-6 rounded cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-md ${getIntensityColor(day.intensity)}`}
                            title={`${day.displayDate.toLocaleDateString()}: ${day.count} uploads by ${day.userCount} users`}
                            onClick={() => setSelectedDate(day)}
                        />
                    ))}
                </div>

                {/* Day labels */}
                <div className="grid grid-cols-10 gap-1 text-xs text-gray-500">
                    {days.map((day, index) => (
                        <div key={`day-${index}`} className="text-center">
                            {index % 7 === 0 ? getDayName(day.displayDate) : ''}
                        </div>
                    ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Less</span>
                        <div className="flex space-x-1">
                            <div className="w-3 h-3 bg-gray-100 rounded"></div>
                            <div className="w-3 h-3 bg-blue-200 rounded"></div>
                            <div className="w-3 h-3 bg-blue-300 rounded"></div>
                            <div className="w-3 h-3 bg-blue-400 rounded"></div>
                            <div className="w-3 h-3 bg-blue-500 rounded"></div>
                            <div className="w-3 h-3 bg-blue-600 rounded"></div>
                        </div>
                        <span>More</span>
                    </div>
                    
                    {selectedDate && (
                        <div className="text-sm text-gray-700">
                            <strong>{selectedDate.displayDate.toLocaleDateString()}</strong>: 
                            {selectedDate.count} uploads by {selectedDate.userCount} users
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
