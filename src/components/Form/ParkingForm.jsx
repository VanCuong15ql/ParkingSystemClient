import React, { useState, useEffect } from 'react';

const ParkingForm = ({ initialData = null, title, handleSubmit, handleCancel, handleDelete }) => {
    const [formData, setFormData] = useState(initialData);
    console.log("initialData", formData);
    const handleChange = (e) => {
        console.log(e.target.name, e.target.value);
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(e, formData);
    }

    return (
        <div className="parking-form-container" style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
            <form onSubmit={onSubmit}>
                {title && <h3>{title}</h3>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <label><b>Type:</b></label>
                    <select name="typeParking" value={formData?.typeParking} onChange={handleChange} required>
                        <option value="">Select Type</option>
                        <option value="car">Car</option>
                        <option value="bike">Bike</option>
                        <option value="motor">Motor</option>
                    </select>
                    <label><b>Name:</b></label>
                    <input type="text" name="name" value={formData?.name} onChange={handleChange} required />

                    <div className='form-actions' style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {handleDelete && (<button type="delete" onClick={handleDelete}>Delete</button>)}
                        <button type="cancel" onClick={handleCancel}>Cancel</button>
                        <button type="submit">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ParkingForm;