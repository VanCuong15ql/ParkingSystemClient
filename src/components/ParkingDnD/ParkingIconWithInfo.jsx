import React from 'react';
import { useDrag } from 'react-dnd';
import { FaCarSide } from "react-icons/fa";
import { MdOutlinePedalBike } from "react-icons/md";
import { FaMotorcycle } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
const ParkingIconWithInfo = ({ parkingSpace, onEdit }) => {
    // Determine the color based on the parking space's health and state
    const healthColor = parkingSpace.healt === 'live' ? 'green' : 'red';
    const stateColor = parkingSpace.state === 'available' ? 'green' : 'red';
    const typeParking = parkingSpace.typeParking;
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'PARKING_ICON_WITH_INFO',
        item: parkingSpace,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <div
            ref={drag}
            style={{
                width: '64.72px',
                height: '40px',
                border: `2px solid ${stateColor}`,
                borderRadius: '8px',
                background: 'white',
                opacity: isDragging ? 0.5 : 1,
                cursor: 'grab',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
            }}
        >
            {/* Health indicator at the top left */}
            <div
                style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    backgroundColor: healthColor,
                    color: 'white',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    fontSize: '9px'
                }}
            >
                {parkingSpace.healt}
            </div>
            {/* Edit button */}
            <button
                style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'white',
                    border: 'none',
                    cursor: 'pointer'
                }}
                onClick={() => onEdit(parkingSpace)}
            >
                <MdEdit />
            </button>
            {typeParking === 'car' ? (
                <FaCarSide size={30} color={stateColor} />
            ) : typeParking === 'bike' ? (
                <MdOutlinePedalBike size={30} color={stateColor} />
            ) : typeParking === 'motor' ? (
                <FaMotorcycle size={30} color={stateColor} />
            ) : null}
        
            
            <span style={{ marginTop: '4px', fontWeight: 'bold' }}>{parkingSpace.name}</span>
        </div>
    );
};

export default ParkingIconWithInfo;