import React from 'react';

const UserParkingform = ({ initialData = null, title, handleSubmit, handleCancel, handleDelete }) => {
    const [userId, setUserId] = React.useState(localStorage.getItem('userId'));
    const [formData, setformData] = React.useState({
        _id: initialData?._id || null,
        uid: initialData?.uid || '',
        name: initialData?.name || '',
        gender: initialData?.gender || 'Select gender',
        email: initialData?.email || '',
        numberphone: initialData?.numberphone || '',
        address: initialData?.address || '',
        userId: initialData?.userId || userId, // Gán userId từ innitialData hoặc localStorage
    });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setformData((prev) => ({ ...prev, [name]: value }));
    }
    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(formData);
    }
    return (
        <div className='form-container'>

            <form
                onSubmit={onSubmit}>
                <h3>{title}</h3>
                <div >
                    <label htmlFor="uid">UID:</label>
                    <input type="text" id="uid" name="uid" value={formData.uid} onChange={handleChange} required />
                </div>
                <div >
                    <label htmlFor="name">Name:</label>
                    <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Gender:</label>
                    <select
                        name='gender'
                        value={formData.gender}
                        onChange={handleChange}
                        required>
                        <option value="">Select gender</option>
                        <option value='Male'>Male</option>
                        <option value='Female'>Female</option>
                    </select>
                </div>
                <div >
                    <label htmlFor="email">Email:</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                </div>
                <div >
                    <label htmlFor="numberphone">Phone Number:</label>
                    <input type="tel" id="numberphone" name="numberphone" value={formData.numberphone} onChange={handleChange} required />
                </div>
                <div>
                    <label htmlFor="address">Address:</label>
                    <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} required />
                </div>
                <div className='form-actions' >
                    {handleDelete && (
                        <button
                            type="delete"
                            onClick={(e) => { e.preventDefault(); handleDelete(formData._id) }}>
                            Delete
                        </button>)}
                    <button
                        type="cancel"
                        onClick={handleCancel}>
                        Cancel
                    </button>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    )
}
export default UserParkingform;