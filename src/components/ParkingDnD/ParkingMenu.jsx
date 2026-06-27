import React from 'react';
import { FaCarSide } from "react-icons/fa";
import { MdOutlinePedalBike } from "react-icons/md";
import { FaMotorcycle } from "react-icons/fa";
import ParkingIcon from './ParkingIcon';
import ParkingIconWithInfo from './ParkingIconWithInfo';

const ParkingMenu = ({ 
    dbParkingSpaces, 
    filter, 
    setFilter, 
    onAddClick, 
    onEditClick,
    showAddForm
}) => {
    // filter parking spaces by type
    const filteredSpaces = dbParkingSpaces?.filter(space => {
        if (filter === 'set') {
            return space.locationx !== 0 && space.locationy !== 0;
        }
        if (filter === 'unset') {
            return space.locationx === 0 && space.locationy === 0;
        }
        if (filter === 'car') {
            return space.typeParking === 'car';
        }
        if (filter === 'bike') {
            return space.typeParking === 'bike';
        }
        if (filter === 'motor') {
            return space.typeParking === 'motor';
        }
        return true;
    });

    return (
        <div style={{ marginLeft: "30px", width: "320px", boxSizing: "border-box" }}>
            {/* button car to drag and drop */}
            <span style={{ fontWeight: "bold" }}>Parking</span>
            <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div style={{ display: "flex", gap: "10px", backgroundColor: "gray", borderRadius: "5px", padding: "10px", marginTop: "10px" }}>
                    <div>
                        <ParkingIcon component={FaCarSide} />
                    </div>
                    <div>
                        <ParkingIcon component={MdOutlinePedalBike} />
                    </div>
                    <div>
                        <ParkingIcon component={FaMotorcycle} />
                    </div>
                </div>
            </div>
            <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)} 
                style={{ marginTop: "10px", padding: "5px", borderRadius: "5px", height: "35px", width: "100px" }}>
                <option value="all">Tất cả</option>
                <option value="set">Đã đặt</option>
                <option value="unset">Chưa đặt</option>
                <option value="car">Xe hơi</option>
                <option value="bike">Xe đạp</option>
                <option value="motor">Xe máy</option>
            </select>
            <button className='button-form'
                style={{
                    backgroundColor: "black",
                    color: "white",
                    marginLeft: "25px",
                }} onClick={onAddClick}>AddParking</button>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px", overflowY: "auto", marginTop: "10px", padding: "10px", backgroundColor: "white", borderRadius: "5px" }}>
                {/* show parking space */}
                {filteredSpaces.map((space, index) => (
                    <div key={index}>
                        <ParkingIconWithInfo
                            parkingSpace={space}
                            onEdit={onEditClick}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ParkingMenu;
