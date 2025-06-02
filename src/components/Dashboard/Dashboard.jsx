import { FaUsers } from "react-icons/fa";
import { LuAlignVerticalSpaceAround } from "react-icons/lu";
import { MdEventAvailable } from "react-icons/md";
import React, { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';


ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function formatDate(date) {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}




const Dashboard = () => {
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

    const userId = localStorage.getItem('userId');

    const [startDate, setStartDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - 7); // 7 days ago
        return formatDate(d);
    });
    const [endDate, setEndDate] = useState(() => {
        const d = new Date();
        return formatDate(d);
    });
    const { data: userParkings = [], isLoading } = useQuery({
        queryKey: ['userParkings', userId],
        queryFn: async () => {
            const response = await axios.get(`${urlServer}/user-parking`, { params: { userId } });
            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    const { data: accessRecords = [], isLoading: isLoadingAccess } = useQuery({
        queryKey: ['accessRecords', userId],
        queryFn: async () => {
            const response = await axios.get(`${urlServer}/access-manage`, { params: { userId } });
            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    const lineChartData = useMemo(() => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            days.push(formatDate(new Date(d)));
        }
        const counts = days.map(day => {
            return accessRecords.filter(record => {
                const entered = record.timeEntered ? formatDate(new Date(record.timeEntered)) : null;
                return entered === day;
            }).length;

        });
        return {
            labels: days,
            datasets: [
                {
                    label: 'Số lượng ra/vào',
                    data: counts,
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                },
            ],
        };
    }, [startDate, endDate, accessRecords]);

    const lineOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Số lượng ra/vào theo ngày',
            },
        },
        scales:{
            y:{
                beginAtZero: true,
            }
        }
    }

    const { data: parkingSpaces = [], isLoading: isLoadingParking } = useQuery({
        queryKey: ['parkingSpaces', userId],
        queryFn: async () => {
            const response = await axios.get(`${urlServer}/parking-spaces`, { params: { userId } });
            return response.data;
        },
        refetchOnWindowFocus: false,
    });

    const sampleParkingTimes = [
        { uid: 'U001', name: 'Nguyễn Văn A', time: '3h' },
        { uid: 'U002', name: 'Trần Thị B', time: '4h' },
        { uid: 'U003', name: 'Lê Văn C', time: '5h' },
        { uid: 'U004', name: 'Phạm Thị D', time: '6h' },
    ];

    const totalUsers = userParkings ? userParkings.length : 0;
    const totalParkingSpaces = parkingSpaces ? parkingSpaces.length : 0;
    const totalAvailableParkingSpaces = parkingSpaces ? parkingSpaces.filter(space => space.state === 'available').length : 0;
    return (
        <div className="dashboard p-6 bg-gray-200 min-h-screen">
            <div className="container_sum_data grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className='stage_sum_userParking bg-white rounded-xl shadow p-6 flex flex-col   '>
                    <div className='stage_header flex  mb-2'>
                        {/* line */}
                        <div className="w-1 h-auto bg-blue-500 mr-4"></div>
                        <div className='stage_information flex flex-col items-start'>
                            <div className="text-gray-500 text-sm">Users</div>
                            <div className="text-2xl font-bold text-blue-700">{totalUsers}</div>
                        </div>
                        {/* icon */}
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full ml-auto" ><FaUsers /></div>
                    </div>
                    <div className='stage_note text-gray-400 text-xs mt-2'>
                        Sum of all users in the system
                    </div>
                </div>
                <div className='stage_sum_userParking bg-white rounded-xl shadow p-6 flex flex-col   '>
                    <div className='stage_header flex  mb-2'>
                        {/* line */}
                        <div className="w-1 h-auto bg-blue-500 mr-4"></div>
                        <div className='stage_information flex flex-col items-start'>
                            <div className="text-gray-500 text-sm">Parking Space</div>
                            <div className="text-2xl font-bold text-blue-700">{totalParkingSpaces}</div>
                        </div>
                        {/* icon */}
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full ml-auto" ><LuAlignVerticalSpaceAround /></div>
                    </div>
                    <div className='stage_note text-gray-400 text-xs mt-2'>
                        Sum of total parking space in the system
                    </div>
                </div>
                <div className='stage_sum_userParking bg-white rounded-xl shadow p-6 flex flex-col   '>
                    <div className='stage_header flex  mb-2'>
                        {/* line */}
                        <div className="w-1 h-auto bg-blue-500 mr-4"></div>
                        <div className='stage_information flex flex-col items-start'>
                            <div className="text-gray-500 text-sm">Available Space</div>
                            <div className="text-2xl font-bold text-blue-700">{totalAvailableParkingSpaces}</div>
                        </div>
                        {/* icon */}
                        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full ml-auto" ><MdEventAvailable /></div>
                    </div>
                    <div className='stage_note text-gray-400 text-xs mt-2'>
                        Sum of all available parking space
                    </div>
                </div>


            </div>

            <div className='stage_analytics grid grid-cols-1 md:grid-cols-1 gap-6 mt-6'>
                <div className="stage_tabletime_userParkings mt-6 rounded-xl shadow p-6 bg-white">
                    <div>
                        <div>
                            <label className="font-semibold mr-2">
                                From
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                max={endDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="rounded p-2 mr-4"
                            />

                            <label className="font-semibold mr-2">
                                To
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                min={startDate}
                                max={formatDate(new Date())}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="rounded p-2"
                            />
                        </div>
                    </div>
                    <div className="bg-white rounded-xl shadow p-6">
                        <Line data={lineChartData} options={lineOptions} />
                    </div>
                </div>
                {/* <table className="min-w-full border border-gray-200">
                    <thead>
                        <tr>
                            <th >STT</th>
                            <th>UID</th>
                            <th>Name</th>
                            <th className="text-blue-500">Time</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sampleParkingTimes.map((item, index) => (
                            <tr key={index}>
                                <td>{index + 1}</td>
                                <td>{item.uid}</td>
                                <td>{item.name}</td>
                                <td className="text-blue-400">{item.time}</td>
                            </tr>
                        ))}
                    </tbody>
                </table> */}
            </div>
        </div>
    );
}
export default Dashboard;