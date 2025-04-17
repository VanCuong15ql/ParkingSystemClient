import React from 'react';
import { MdOutlineMenu } from "react-icons/md";

const Topbar = ({onToggle}) => {
    return (
        <div className="topbar">
            <div className="toggle" onClick={onToggle}>
                <MdOutlineMenu />
            </div>

            <div className="search">
                <label>
                    <input type="text" placeholder="Search here" />
                    <ion-icon name="search-outline"></ion-icon>
                </label>
            </div>

            <div className="user">
                <img src="assets/imgs/customer01.jpg" alt="User" />
            </div>
        </div>
    );
};

export default Topbar;