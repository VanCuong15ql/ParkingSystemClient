import React,{useState,useEffect} from 'react';
import { FaListUl } from "react-icons/fa";
import { IoGrid } from "react-icons/io5";
import { IoSearchOutline } from "react-icons/io5";
import { SlOptionsVertical } from "react-icons/sl";
import { FaUserCircle } from "react-icons/fa";
import UserParkingForm from '../Form/UserParkingForm';
import axios from 'axios';
const Management = () => {
    const [showForm, setShowForm] = React.useState(false);
    const [showFormEdit, setShowFormEdit] = useState(false);
    const [userParkings, setUserParkings] = React.useState([]);
    const [selectedUserParking, setSelectedUserParking] = useState(null);
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const [userId, setUserId] = React.useState(localStorage.getItem('userId'));

    useEffect(() => {
        fetchUserParkings();
    },[]);
    const handleCancel = () => {
        setShowForm(false);
        setShowFormEdit(false);
    }
    const handleSubmit = async(formData)=>{
        try{
            const reponse = await axios.post(`${urlServer}/user-parking`, formData);
            console.log('user added successfully:', reponse.data);
            setShowForm(false);
            window.FuiToast.success('Add user successfully!');
            fetchUserParkings();

        }catch (error) {
            console.error('Error adding user:', error);
            if(error.response.status === 400) {
                window.FuiToast.error('User parking with this UID or email already exists');
            }
        }
    }
    const handleDelete = async (id)=>{
        try{
            const response = await axios.delete(`${urlServer}/user-parking/${id}`);
            console.log('User deleted successfully:', response.data);
            setShowFormEdit(false);
            fetchUserParkings();
            window.FuiToast.success('Delete user successfully!');
        }catch (error) {
            console.error('Error deleting user:', error);
            window.FuiToast.error('Error deleting user');
        }
    }
    
    const handleSubmitEdit = async (formData) => {
        try {
            const response = await axios.put(`${urlServer}/user-parking/${formData._id}`, formData);
            console.log('User updated successfully:', response.data);
            setShowFormEdit(false);
            fetchUserParkings();
            window.FuiToast.success('Update user successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            if(error.response.status === 400) {
                window.FuiToast.error('User parking with this UID or email already exists');
            }
        }
    }

    const handleEdit =  (user) => {
        setSelectedUserParking(user);
        setShowFormEdit(true);
        console.log(selectedUserParking);
    }

    const fetchUserParkings = async () => {
            try {
                const response = await axios.get(`${urlServer}/user-parking`);
                setUserParkings(response.data);
            } catch (error) {
                console.error('Error fetching user parkings:', error);
            }
        }
    return (
        <div className="management-container">
            <div className='management-header'>
                <h1>User list</h1>
                <button 
                    className='button-form'
                    onClick={() => setShowForm(!showForm)}>
                        AddUser
                </button>
            </div>
        
            <div className='management-taskbar'>
                <button type='list' className='button-form' >
                    <FaListUl />
                    LIST
                </button>
                <button type='grid' className='button-form'>
                    <IoGrid />
                    GRID
                </button>
                <div style={{ flexGrow: 1 }}></div>
                <div className='search-bar'>
                    <select
                        className='filter-select'
                        >
                        <option value="">Search by</option>
                        <option value="name">Name</option>
                        <option value="email">Email</option>
                        <option value="phonenumber">Phonenumber</option>
                        <option value="uid">Uid</option>
                    </select>
                    <div className='search-input-container'>
                    <IoSearchOutline className='search-icon' />
                    <input
                        type="text"
                        className='search-input'
                        placeholder="Search..."
                    >
                        
                    </input>
                    </div>
                    <button
                        className='button-form'>
                        Search
                    </button>
                </div>
            </div>
            {/* table user */}
            <div>
            
                <table className='user-table'>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Uid</th>
                            <th>Gender</th>
                            <th>Phone Number</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                            {userParkings.map((userParking) => (
                                <tr key={userParking._id}>
                                    <td>
                                        <div
                                            style={{ display: 'flex', alignItems: 'center',gap: '5px' }}>
                                        <FaUserCircle style={{fontSize: "1.2rem"}}/> {userParking.name}
                                        </div>
                                    </td>
                                    <td>{userParking.uid}</td>
                                    <td>{userParking.gender}</td>
                                    <td>{userParking.numberphone}</td>
                                    <td>{userParking.email}</td>
                                    <td>
                                        <SlOptionsVertical 
                                            style={{cursor: 'pointer'}}
                                            onClick={()=>handleEdit(userParking)}/>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
            {showForm && (
                <UserParkingForm 
                    title={"Add User"}
                    handleCancel={handleCancel}
                    handleSubmit={handleSubmit}/>
            )}
            {showFormEdit && (
                <UserParkingForm 
                    title={"Edit User"}
                    handleCancel={handleCancel}
                    handleSubmit={handleSubmitEdit}
                    handleDelete={handleDelete}
                    initialData={selectedUserParking}/>
            )}
        </div>
    );
}
export default Management;