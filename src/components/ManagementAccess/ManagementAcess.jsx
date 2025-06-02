import React, { useState, useEffect } from 'react';
import { IoSearchOutline } from "react-icons/io5";
import axios from 'axios';

const ManagementAccess = () => {
    const [accessRecords, setAccessRecords] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const userId = localStorage.getItem('userId');
    useEffect(() => {
        fetchAccessRecords();
        const interval = setInterval(() => {
            fetchAccessRecords();
        }, 2000); 
        return () => clearInterval(interval); 
    }, []);

    const fetchAccessRecords = async () => {
        try {

            const response = await axios.get(`${urlServer}/access-manage`, {
                params: {
                    userId: userId
                }
            });
            setAccessRecords(response.data);
            console.log('Access records:', response.data);
        } catch (error) {
            console.error('Error fetching access records:', error);
        }
    };

    const handleSearch = () => {
        const filteredRecords = accessRecords.filter(record =>
            record.uid.includes(searchQuery) ||
            record.userId.includes(searchQuery)
        );
        setAccessRecords(filteredRecords);
    };

    return (
        <div className="management-container">
            <div className="management-header">
                <h1>Access Management</h1>
            </div>
            <div className="management-taskbar">
                <div className="search-bar">
                    <div className="search-input-container">
                        <IoSearchOutline className="search-icon" />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by UID or User ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="button-form" onClick={handleSearch}>
                        Search
                    </button>
                </div>
            </div>
            <div>
                <table className="access-table">
                    <thead>
                        <tr>
                            <th>UID</th>
                            <th>User Name</th>
                            <th>Time Entered</th>
                            <th>Time Exited</th>
                        </tr>
                    </thead>
                    <tbody>
                        {accessRecords.map((record) => (
                            <tr key={record._id}>
                                <td>{record.uid}</td>
                                <td>{record.userParkingId?.name||"N/A"}</td>
                                <td>{record.timeEntered ? new Date(record.timeEntered).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'N/A'}</td>
                                <td>{record.timeExited ? new Date(record.timeExited).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagementAccess;