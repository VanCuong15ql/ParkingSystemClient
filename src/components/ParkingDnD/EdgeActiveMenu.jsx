import React from 'react';
import { FaTrash } from 'react-icons/fa';

const EdgeActiveMenu = ({ edge, position, onDelete, onClose }) => {
    if (!edge) return null;

    const fromName = edge.fromNode?.name || edge.fromNode?.type || 'Node';
    const toName = edge.toNode?.name || edge.toNode?.type || 'Node';

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
                    minWidth: '160px',
                    border: '1px solid #ddd',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    {fromName} ↔ {toName}
                </div>
                <button
                    onClick={() => onDelete(edge)}
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
                    <FaTrash size={12} /> Xóa đường nối
                </button>
            </div>
        </>
    );
};

export default EdgeActiveMenu;
