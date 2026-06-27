import React from 'react';
import { FaDoorOpen } from 'react-icons/fa';
import { MdCallSplit } from 'react-icons/md';
import { FaLink } from 'react-icons/fa6';
import { TbCircleDot } from 'react-icons/tb';

const NODE_CONFIG = {
    entrance: { icon: FaDoorOpen, color: '#E91E63', label: 'Cổng vào' },
    intersection: { icon: MdCallSplit, color: '#FF9800', label: 'Giao lộ' },
    zone_link: { icon: FaLink, color: '#9C27B0', label: 'Liên kết zone' },
    connector: { icon: TbCircleDot, color: '#607D8B', label: 'Nối' },
};

const NodeIcon = ({ node, onEdit }) => {
    const config = NODE_CONFIG[node.type] || NODE_CONFIG.connector;
    const Icon = config.icon;

    return (
        <div
            onClick={() => onEdit && onEdit(node)}
            title={node.name || config.label}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: onEdit ? 'pointer' : 'default',
            }}
        >
            <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: config.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                border: '2px solid white',
                boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            }}>
                <Icon size={16} />
            </div>
            {node.name && (
                <span style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    color: config.color,
                    marginTop: '2px',
                    whiteSpace: 'nowrap',
                    textShadow: '0 0 3px white, 0 0 3px white',
                }}>
                    {node.name}
                </span>
            )}
        </div>
    );
};

export { NODE_CONFIG };
export default NodeIcon;
