import React from 'react';
import { FaCarSide } from 'react-icons/fa';
import { MdOutlinePedalBike } from 'react-icons/md';
import { FaMotorcycle } from 'react-icons/fa';

const ZoneSlotsActiveMenu = ({ zone, slots, position, onClose, isLoading, placement = 'right' }) => {
    if (!zone) return null;

    const menuStyle = {
        position: 'fixed',
        top: position.y,
        zIndex: 999,
        ...(placement === 'left'
            ? { left: position.x, transform: 'translateX(-100%)' }
            : { left: position.x }),
    };

    return (
        <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
            <div
                style={{
                    ...menuStyle,
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    padding: '10px',
                    minWidth: '200px',
                    maxWidth: '280px',
                    maxHeight: '320px',
                    overflowY: 'auto',
                    border: '1px solid #ddd',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#4CAF50' }}>
                    {zone.zone_name}
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginBottom: '8px' }}>
                    Parking slots trong zone
                </div>
                {isLoading ? (
                    <p style={{ fontSize: '12px', color: '#999' }}>Đang tải...</p>
                ) : slots.length === 0 ? (
                    <p style={{ fontSize: '12px', color: '#999' }}>Không có slot nào trong zone</p>
                ) : (
                    slots.map((slot) => (
                        <div
                            key={slot._id}
                            style={{
                                padding: '6px 8px',
                                marginBottom: '4px',
                                backgroundColor: '#f5f5f5',
                                borderRadius: '4px',
                                fontSize: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderLeft: `3px solid ${slot.state === 'available' ? '#4CAF50' : '#f44336'}`,
                            }}
                        >
                            {slot.typeParking === 'car' ? <FaCarSide size={14} /> :
                             slot.typeParking === 'bike' ? <MdOutlinePedalBike size={14} /> :
                             <FaMotorcycle size={14} />}
                            <span>{slot.name}</span>
                            <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#666' }}>
                                {slot.state}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </>
    );
};

export default ZoneSlotsActiveMenu;
