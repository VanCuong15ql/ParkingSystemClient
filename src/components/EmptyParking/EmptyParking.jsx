import React from 'react';
import axios from 'axios';
import ParkingIcon from '../ParkingDnD/ParkingIcon';
import { IoAddSharp } from "react-icons/io5";
import { FaCarSide } from "react-icons/fa";
import { MdOutlinePedalBike } from "react-icons/md";
import { FaMotorcycle } from "react-icons/fa";
import ParkingIconWithInfo from '../ParkingDnD/ParkingIconWithInfo';
import { DndProvider, useDrop } from 'react-dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ParkingForm from '../Form/ParkingForm';


const EmptyParking = () => {
    //set form
    const [showAddForm, setShowAddForm] = React.useState(false);
    const [formData, setFormData] = React.useState({ type: "", name: "" });
    const [editingParking, setEditingParking] = React.useState(false);
    const [editFormData, setEditFormData] = React.useState(null);
    const [filter, setFilter] = React.useState("all");

    const [userId, setUserId] = React.useState(localStorage.getItem('userId'));
    const [positions, setPositions] = React.useState([]);
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (newParking) => {
            const response = await axios.post('http://localhost:5000/parking-spaces', newParking);
            return response.data;
        },

        onSuccess: () => {
            queryClient.invalidateQueries('parkingSpaces');
            setShowAddForm(false);
            setFormData({ type: "", name: "" });
            window.FuiToast.success('Add parking space successfully!');
        },
        onError: (error) => {
            console.error('Error adding parking space:', error);
            window.FuiToast.error('Error adding parking space!');
        }

    }
    );
    const editMutation = useMutation({
        mutationFn: async (editParking) => {
            const response = await axios.put(`${urlServer}/parking-spaces/${editParking._id}`, editParking);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries('parkingSpaces');
            setEditingParking(false);
            setEditFormData({ type: "", name: "" });
            window.FuiToast.success('Edit parking space successfully!');
        },
        onError: (error) => {
            console.error('Error editing parking space:', error);
            window.FuiToast.error('Error editing parking space!');
        }
    });
    const deleteMutation = useMutation({
        mutationFn: async (parkingSpace) => {
            const response = await axios.delete(`${urlServer}/parking-spaces/${parkingSpace._id}`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries('parkingSpaces');
            window.FuiToast.success('Delete parking space successfully!');
        },
        onError: (error) => {
            console.error('Error deleting parking space:', error);
            window.FuiToast.error('Error deleting parking space!');
        }
    });
    const handleSubmit = (e,formData) => {
        e.preventDefault();
        const newParking = {
            name: formData.name,
            type: formData.type,
            userId: userId,
        };
        console.log("new parking space", newParking);
        mutation.mutate(newParking);

    }
    const handleCancle = () => {
        setShowAddForm(false);
        setFormData({ type: "", name: "" });
        window.FuiToast.warning("Cancel add parking space!");
    }
    const handleCancelEdit = () => {
        setEditingParking(false);
        setEditFormData(null);
        window.FuiToast.warning("Cancel edit parking space!");
    }
    const handleDelete = () => {
        deleteMutation.mutate(editFormData);
        setEditingParking(false);
        setEditFormData(null);
    }

    const [, drop] = useDrop(() => ({
        accept: "PARKING_ICON_WITH_INFO",
        drop: (item, monitor) => {
            const offset = monitor.getSourceClientOffset();
            if (offset) {
                const map = document.getElementById("map").getBoundingClientRect();
                const x = offset.x - map.left;
                const y = offset.y - map.top;
                console.log("update location space: ", item.name);
                axios.post(`${urlServer}/parking-spaces/location/${item._id}`, {
                    locationx: x,
                    locationy: y,
                })
                    .then((response) => {
                        console.log("Update parking space successfully", response.data);
                        queryClient.invalidateQueries('parkingSpaces');
                    })
                    .catch((error) => {
                        console.error("Error updating parking space:", error);
                    });
            }
        },
    }));
    //get all parking spaces from db
    const fetchParkingSpaces = async () => {
        const response = await axios.get(`${urlServer}/parking-spaces`, {
            params: { userId: userId },
        });
        console.log("response parking spaces", response.data);
        return response.data;
    }
    const { data: dbParkingSpaces=[], isLoading, error } = useQuery({
        queryKey: ['parkingSpaces'],
        queryFn: fetchParkingSpaces,
        onSuccess: (data) => {
            console.log('Fetched parking spaces:', dbParkingSpaces);
        },
        onError: (error) => {
            console.error('Error fetching parking spaces:', error);
        },
    });
    const handleEditClick = (parkingSpace) => {
        setEditingParking(true);
        setEditFormData(parkingSpace);
        console.log("parking space to edit", parkingSpace);
    }
    const handleSubmitEdit = (e, formData) => {
        e.preventDefault();
        const editParking = {
            name: formData.name,
            type: formData.type,
            userId: userId,
            _id: editFormData._id,
        };
        console.log("edit parking space", editParking);
        editMutation.mutate(editParking);
    }
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
        <div className='container' style={{ marginLeft: "10px", display: "flex", flexDirection: "row" }}>
            <div ref={drop} id="map" style={{ position: "relative", width: "800px", height: "500px" }} >
                <img src="/parking-map.jpg" alt="parking map" style={{ width: "100%", height: "100%", border: "0.3px solid rgba(0,0,0,1)" }} ></img>
                {dbParkingSpaces.filter(space => space.locationx!==0 && space.locationy!==0)?.map((space) => (
                    <div
                        key={space._id}
                        style={{
                            position: "absolute",
                            left: `${space.locationx}px`,
                            top: `${space.locationy}px`,
                            width: "40px",
                            height: "40px",
                        }}
                    >
                        <ParkingIconWithInfo
                            parkingSpace={space}
                            onEdit={handleEditClick}
                        />
                    </div>
                ))}
                {/* {dbParkingSpaces.map((space, index) => (
                    <div
                        key={index}
                        style={{
                            position: "absolute",
                            left: `${space.locationx}px`,
                            top: `${space.locationy}px`,
                            width: "40px",
                            height: "40px",
                        }}
                    >
                        <ParkingIcon component={FaCarSide} />
                    </div>
                ))} */}
            </div >
            <div style={{ marginLeft: "30px" }}>
                {/* button car to drag and drop */}
                <span style={{ fontWeight: "bold" }}>Parking</span>
                <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                    <div style={{ display: "flex", gap: "10px", backgroundColor: "gray", borderRadius: "5px", padding: "10px", marginTop: "10px" }}>
                        <div >
                            <ParkingIcon component={FaCarSide} />
                        </div>
                        <div >
                            <ParkingIcon component={MdOutlinePedalBike} />
                        </div>
                        <div >
                            <ParkingIcon component={FaMotorcycle} />
                        </div>
                    </div>
                    <div style={{ padding: "10px", marginTop: "10px", backgroundColor: "blue", color: "white" }}>
                        <button onClick={() => setShowAddForm(true)}><IoAddSharp /></button>
                    </div>
                </div>
                <span>Lọc theo</span>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ marginTop: "10px", padding: "5px", borderRadius: "5px" }}>
                    <option value="all">Tất cả</option>
                    <option value="set">Đã đặt</option>
                    <option value="unset">Chưa đặt</option>
                    <option value="car">Xe hơi</option>
                    <option value="bike">Xe đạp</option>
                    <option value="motor">Xe máy</option>
                </select>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "400px",overflowY:"auto", marginTop: "10px", padding: "10px", backgroundColor: "white", borderRadius: "5px" }}>
                    {/* show parking space */}
                    {filteredSpaces.map((space, index) => (
                        <div key={index}>
                            <ParkingIconWithInfo
                                parkingSpace={space}
                                onEdit={handleEditClick}
                            />
                        </div>
                    ))}
                </div>
            </div>
            {/* form add parking space */}
            {showAddForm && (
                <ParkingForm
                    title={"Add Parking Space"}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancle}
                />
            )}
            {editingParking&&(
                <ParkingForm
                    title={"Edit Parking Space"}
                    initialData={editFormData}
                    handleSubmit={handleSubmitEdit}
                    handleCancel={handleCancelEdit}
                    handleDelete={handleDelete}
                />
            )}
        </div>
    );
}
export default EmptyParking;