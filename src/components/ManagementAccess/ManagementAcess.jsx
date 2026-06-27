import React, { useState, useEffect } from 'react';
import { IoSearchOutline } from "react-icons/io5";
import { FaTrash } from "react-icons/fa";
import axios from 'axios';

const PlateImage = ({ base64, alt }) => {
    if (!base64) return <span>N/A</span>;
    const src = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    return (
        <img
            src={src}
            alt={alt}
            style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }}
        />
    );
};

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
                params: { userId },
            });
            setAccessRecords(response.data);
        } catch (error) {
            console.error('Error fetching access records:', error);
        }
    };

    const handleDelete = async (recordId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bản ghi này?')) return;

        try {
            await axios.delete(`${urlServer}/access-manage/${recordId}`);
            window.FuiToast?.success('Xóa bản ghi thành công');
            fetchAccessRecords();
        } catch (error) {
            console.error('Error deleting access record:', error);
            window.FuiToast?.error('Lỗi khi xóa bản ghi');
        }
    };

    const filteredRecords = accessRecords.filter((record) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            record.uid?.toLowerCase().includes(q) ||
            record.userId?.toLowerCase().includes(q) ||
            record.userParkingId?.name?.toLowerCase().includes(q)
        );
    });

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
                            placeholder="Tìm theo UID, tên..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="access-table">
                    <thead>
                        <tr>
                            <th>UID</th>
                            <th>User Name</th>
                            <th>Time Entered</th>
                            <th>Image Enter</th>
                            <th>Time Exited</th>
                            <th>Image Exit</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRecords.map((record) => (
                            <tr key={record._id}>
                                <td>{record.uid}</td>
                                <td>{record.userParkingId?.name || 'N/A'}</td>
                                <td>
                                    {record.timeEntered
                                        ? new Date(record.timeEntered).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                                        : 'N/A'}
                                </td>
                                <td>
                                    <PlateImage base64={record.plate_image_enter} alt="Plate enter" />
                                </td>
                                <td>
                                    {record.timeExited
                                        ? new Date(record.timeExited).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
                                        : 'N/A'}
                                </td>
                                <td>
                                    <PlateImage base64={record.plate_image_exit} alt="Plate exit" />
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDelete(record._id)}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: '#f44336',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                        }}
                                    >
                                        <FaTrash size={12} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagementAccess;
