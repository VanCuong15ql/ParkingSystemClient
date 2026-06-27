import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { FaDoorOpen } from 'react-icons/fa';
import { MdCallSplit } from 'react-icons/md';
import { FaLink } from 'react-icons/fa6';
import { TbCircleDot } from 'react-icons/tb';
import axios from 'axios';
import { NODE_CONFIG } from './NodeIcon';

const USER_CREATABLE_TYPES = [
    { value: 'connector', icon: TbCircleDot, label: 'Node' },
    { value: 'entrance', icon: FaDoorOpen, label: 'Cổng vào' },
    { value: 'zone_link', icon: FaLink, label: 'Liên kết zone' },
];

const ALL_TYPE_ICONS = {
    entrance: FaDoorOpen,
    intersection: MdCallSplit,
    zone_link: FaLink,
    connector: TbCircleDot,
};

const NodeMenu = () => {
    const [nodes, setNodes] = useState([]);
    const [isPlacing, setIsPlacing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [editingNodeId, setEditingNodeId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'connector',
    });

    const userId = localStorage.getItem('userId');
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';

    const fetchNodes = async () => {
        try {
            const response = await axios.get(`${urlServer}/nodes?userId=${userId}`);
            setNodes(response.data);
        } catch (error) {
            console.error('Error fetching nodes:', error);
        }
    };

    useEffect(() => {
        fetchNodes();
    }, []);

    useEffect(() => {
        const refresh = () => fetchNodes();
        window.addEventListener('node-saved', refresh);
        window.addEventListener('edge-saved', refresh);
        window.addEventListener('node-edit-request', (e) => {
            if (e.detail) handleEditNode(e.detail);
        });
        return () => {
            window.removeEventListener('node-saved', refresh);
            window.removeEventListener('edge-saved', refresh);
            window.removeEventListener('node-edit-request', () => {});
        };
    }, []);

    const resetForm = () => {
        setIsPlacing(false);
        setEditingNodeId(null);
        setFormData({ name: '', type: 'connector' });
        window.dispatchEvent(new Event('node-place-finish'));
    };

    const handleStartPlacing = () => {
        setIsPlacing(true);
        window.dispatchEvent(new Event('edge-draw-finish'));
        window.dispatchEvent(new Event('node-place-start'));
    };

    const handleEditNode = (node) => {
        setEditingNodeId(node._id);
        const editableType = USER_CREATABLE_TYPES.some((t) => t.value === node.type)
            ? node.type
            : 'connector';
        setFormData({
            name: node.name || '',
            type: editableType,
        });
        setIsPlacing(true);
        window.dispatchEvent(new Event('edge-draw-finish'));
        window.dispatchEvent(new Event('node-place-start'));
    };

    const isEditingAutoType = () => {
        if (!editingNodeId) return false;
        const node = nodes.find((n) => n._id === editingNodeId);
        return node && node.type === 'intersection';
    };

    const saveNode = async (x, y) => {
        setIsLoading(true);
        try {
            let typeToSave = formData.type;
            if (editingNodeId) {
                const existing = nodes.find((n) => n._id === editingNodeId);
                if (existing?.type === 'intersection') {
                    typeToSave = 'intersection';
                } else if (existing?.type === 'connector' && formData.type === 'connector') {
                    typeToSave = 'connector';
                }
            }

            const payload = { name: formData.name, type: typeToSave, x, y };

            if (editingNodeId) {
                await axios.put(`${urlServer}/nodes/${editingNodeId}`, payload);
                window.FuiToast?.success('Cập nhật node thành công');
            } else {
                await axios.post(`${urlServer}/nodes`, { ...payload, userId });
                window.FuiToast?.success('Tạo node thành công');
            }

            resetForm();
            fetchNodes();
            window.dispatchEvent(new Event('node-saved'));
        } catch (error) {
            console.error('Error saving node:', error);
            window.FuiToast?.error(error.response?.data?.message || 'Lỗi khi lưu node');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const onMapClick = (e) => {
            const { x, y } = e.detail || {};
            if (isPlacing && x !== undefined && y !== undefined) {
                saveNode(x, y);
            }
        };
        window.addEventListener('node-map-click', onMapClick);
        return () => window.removeEventListener('node-map-click', onMapClick);
    }, [isPlacing, formData, editingNodeId, nodes]);

    const handleDeleteNode = async (nodeId) => {
        if (!window.confirm('Bạn có chắc muốn xóa node này?')) return;

        setIsLoading(true);
        try {
            await axios.delete(`${urlServer}/nodes/${nodeId}`);
            window.FuiToast?.success('Xóa node thành công');
            fetchNodes();
            window.dispatchEvent(new Event('node-saved'));
        } catch (error) {
            console.error('Error deleting node:', error);
            window.FuiToast?.error('Lỗi khi xóa node');
        } finally {
            setIsLoading(false);
        }
    };

    const getTypeLabel = (type) => NODE_CONFIG[type]?.label || type;

    return (
        <div style={{ marginLeft: '30px', width: '320px', boxSizing: 'border-box' }}>
            <span style={{ fontWeight: 'bold' }}>Node Management</span>

            <div style={{
                backgroundColor: '#f9f9f9',
                padding: '10px',
                borderRadius: '5px',
                marginTop: '10px',
                border: '1px solid #ddd',
            }}>
                <input
                    type="text"
                    placeholder="Tên node (VD: Cổng chính A)"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{
                        width: '100%',
                        padding: '8px',
                        marginBottom: '8px',
                        borderRadius: '4px',
                        border: '1px solid #ddd',
                        boxSizing: 'border-box',
                    }}
                />

                {isEditingAutoType() ? (
                    <div style={{
                        padding: '8px',
                        marginBottom: '8px',
                        backgroundColor: '#FFF3E0',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: '#E65100',
                    }}>
                        Loại <strong>Giao lộ</strong> — tự động gán bởi hệ thống khi có ≥ 3 đường nối
                    </div>
                ) : (
                    <div style={{ marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#666' }}>Loại node:</span>
                        <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                            {USER_CREATABLE_TYPES.map(({ value, icon: Icon, label }) => {
                                const cfg = NODE_CONFIG[value];
                                const selected = formData.type === value;
                                return (
                                    <button
                                        key={value}
                                        title={label || cfg.label}
                                        onClick={() => setFormData({ ...formData, type: value })}
                                        style={{
                                            flex: 1,
                                            padding: '8px 4px',
                                            backgroundColor: selected ? cfg.color : '#eee',
                                            color: selected ? 'white' : '#333',
                                            border: selected ? `2px solid ${cfg.color}` : '2px solid transparent',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '2px',
                                            fontSize: '9px',
                                        }}
                                    >
                                        <Icon size={18} />
                                        {label && <span>{label}</span>}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {formData.type === 'zone_link' && !isEditingAutoType() && (
                    <p style={{ fontSize: '11px', color: '#9C27B0', margin: '0 0 8px' }}>
                        Đặt node trong vùng zone — hệ thống tự nhận zone
                    </p>
                )}

                {!isPlacing ? (
                    <button
                        onClick={handleStartPlacing}
                        disabled={isLoading}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            backgroundColor: '#FF5722',
                            color: 'white',
                            border: 'none',
                            padding: '8px 15px',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500',
                        }}
                    >
                        <FaPlus /> {editingNodeId ? 'Đặt lại vị trí trên map' : 'Thêm node trên map'}
                    </button>
                ) : (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{
                            flex: 1,
                            padding: '8px',
                            backgroundColor: '#FFF3E0',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#E65100',
                            textAlign: 'center',
                        }}>
                            Click trên map để đặt node
                        </div>
                        <button
                            onClick={resetForm}
                            style={{
                                padding: '8px 12px',
                                backgroundColor: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                            }}
                        >
                            Hủy
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
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#666' }}>Nodes ({nodes.length})</span>
                {nodes.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center', margin: '20px 0' }}>Chưa có node</p>
                ) : (
                    nodes.map((node) => {
                        const cfg = NODE_CONFIG[node.type] || NODE_CONFIG.connector;
                        const Icon = ALL_TYPE_ICONS[node.type] || TbCircleDot;
                        return (
                            <div
                                key={node._id}
                                style={{
                                    padding: '10px',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: '4px',
                                    borderLeft: `4px solid ${cfg.color}`,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: cfg.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                    }}>
                                        <Icon size={14} />
                                    </div>
                                    <div>
                                        <strong>{node.name || getTypeLabel(node.type)}</strong>
                                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#666' }}>
                                            {getTypeLabel(node.type)}
                                            {node.type === 'intersection' && ' (tự động)'}
                                            {node.zoneId?.zone_name && ` → ${node.zoneId.zone_name}`}
                                        </p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                    <button
                                        onClick={() => handleEditNode(node)}
                                        disabled={isLoading}
                                        style={{
                                            padding: '6px 10px',
                                            backgroundColor: '#2196F3',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                        }}
                                    >
                                        <FaEdit size={12} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNode(node._id)}
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
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default NodeMenu;
