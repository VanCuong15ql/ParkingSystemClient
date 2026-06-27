import React from 'react';
import { FaEdit, FaTrash, FaCrosshairs } from 'react-icons/fa';

const NodeActiveMenu = ({ node, position, onEdit, onDelete, onFocus, isFocused, onClose }) => {
    if (!node) return null;

    return (
        <>
            <div
                onClick={onClose}
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 998,
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    zIndex: 999,
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    padding: '8px',
                    minWidth: '140px',
                    border: '1px solid #ddd',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
                    {node.name || node.type}
                </div>
                {node.type === 'entrance' && onFocus && (
                    <button
                        onClick={() => onFocus(node)}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px',
                            marginBottom: '4px',
                            border: 'none',
                            borderRadius: '4px',
                            backgroundColor: isFocused ? '#4CAF50' : '#FF9800',
                            color: 'white',
                            cursor: 'pointer',
                        }}
                    >
                        <FaCrosshairs size={12} />
                        {isFocused ? 'Đang focus' : 'Focus cổng'}
                    </button>
                )}
                <button
                    onClick={() => onEdit(node)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        marginBottom: '4px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#2196F3',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    <FaEdit size={12} /> Chỉnh sửa
                </button>
                <button
                    onClick={() => onDelete(node)}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px',
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        cursor: 'pointer',
                    }}
                >
                    <FaTrash size={12} /> Xóa
                </button>
            </div>
        </>
    );
};

export default NodeActiveMenu;
