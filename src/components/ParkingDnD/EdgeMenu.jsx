import React, { useState, useEffect } from 'react';
import { FaRoute, FaTrash } from 'react-icons/fa';
import axios from 'axios';

const EdgeMenu = () => {
    const [edges, setEdges] = useState([]);
    const [isDrawingEdge, setIsDrawingEdge] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const userId = localStorage.getItem('userId');
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

    const fetchEdges = async () => {
        try {
            const response = await axios.get(`${urlServer}/edges?userId=${userId}`);
            setEdges(response.data);
        } catch (error) {
            console.error('Error fetching edges:', error);
        }
    };

    useEffect(() => {
        fetchEdges();
    }, []);

    useEffect(() => {
        const refresh = () => fetchEdges();
        window.addEventListener('edge-saved', refresh);
        window.addEventListener('node-saved', refresh);
        return () => {
            window.removeEventListener('edge-saved', refresh);
            window.removeEventListener('node-saved', refresh);
        };
    }, []);

    const handleStartEdgeDrawing = () => {
        setIsDrawingEdge(true);
        window.dispatchEvent(new Event('node-place-finish'));
        window.dispatchEvent(new Event('edge-draw-start'));
    };

    const handleCancelEdgeDrawing = () => {
        setIsDrawingEdge(false);
        window.dispatchEvent(new Event('edge-draw-finish'));
    };

    const handleDeleteEdge = async (edgeId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đường nối này?')) return;

        setIsLoading(true);
        try {
            await axios.delete(`${urlServer}/edges/${edgeId}`);
            window.FuiToast?.success('Xóa đường nối thành công');
            fetchEdges();
            window.dispatchEvent(new Event('edge-saved'));
        } catch (error) {
            window.FuiToast?.error('Lỗi khi xóa đường nối');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const onEdgeFinish = () => setIsDrawingEdge(false);
        window.addEventListener('edge-draw-finish', onEdgeFinish);
        return () => window.removeEventListener('edge-draw-finish', onEdgeFinish);
    }, []);

    return (
        <div style={{ marginLeft: '30px', width: '320px', boxSizing: 'border-box' }}>
            <span style={{ fontWeight: 'bold' }}>Edge Management</span>

            <div style={{
                backgroundColor: '#f9f9f9',
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px',
                border: '1px solid #ddd',
            }}>
                {!isDrawingEdge ? (
                    <button
                        onClick={handleStartEdgeDrawing}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: '#3F51B5',
                            color: 'white',
                            border: 'none',
                            padding: '8px 15px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        <FaRoute /> Thêm đường nối
                    </button>
                ) : (
                    <div>
                        <div style={{
                            padding: '8px',
                            backgroundColor: '#E8EAF6',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#283593',
                            marginBottom: '8px',
                        }}>
                            Chọn node thứ 1, rồi node thứ 2 trên map
                        </div>
                        <button
                            onClick={handleCancelEdgeDrawing}
                            style={{
                                width: '100%',
                                padding: '8px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Hủy vẽ đường
                        </button>
                    </div>
                )}
            </div>

            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '450px',
                overflowY: 'auto',
                marginTop: '10px',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '5px',
            }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>
                    Đường nối ({edges.length})
                </span>
                {edges.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', margin: '20px 0', fontSize: '12px' }}>
                        Chưa có đường nối
                    </p>
                ) : (
                    edges.map((edge) => (
                        <div
                            key={edge._id}
                            style={{
                                padding: '10px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                borderLeft: '4px solid #3F51B5',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                            }}
                        >
                            <div style={{ fontSize: '12px' }}>
                                <strong>{edge.fromNode?.name || edge.fromNode?.type}</strong>
                                <span style={{ color: '#666' }}> → </span>
                                <strong>{edge.toNode?.name || edge.toNode?.type}</strong>
                            </div>
                            <button
                                onClick={() => handleDeleteEdge(edge._id)}
                                disabled={isLoading}
                                style={{
                                    padding: '6px 10px',
                                    backgroundColor: '#f44336',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                <FaTrash size={12} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default EdgeMenu;
