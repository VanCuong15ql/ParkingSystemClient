import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome } from "react-icons/fa";
import { FaCarSide } from "react-icons/fa";
import { FaAddressCard } from "react-icons/fa";
import { IoIosHelpCircle } from "react-icons/io";
import { IoSettings } from "react-icons/io5";
import { RiLockPasswordFill } from "react-icons/ri";
import { FaSignOutAlt } from "react-icons/fa";
import { FaSquareParking } from "react-icons/fa6";
import { FaDoorOpen } from "react-icons/fa";

const Navigation = ({ active }) => {
    return (
        <div className={`navigation ${active}`}>
            <ul>
                <li>
                    <Link to="/">
                        <span className="icon">
                            <FaSquareParking/>
                        </span>
                        <span className="title">ParkingSystem</span>
                    </Link>
                </li>
                <li>
                    <Link to="/dashboard">
                        <span className="icon">
                            <FaHome/>
                        </span>
                        <span className="title">Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/empty-parking">
                        <span className="icon">
                            <FaCarSide/>
                        </span>
                        <span className="title">Empty Parking</span>
                    </Link>
                </li>
                <li>
                    <Link to="/management">
                        <span className="icon">
                            <FaAddressCard/>
                        </span>
                        <span className="title">ManagementUsers</span>
                    </Link>
                </li>
                <li>
                    <Link to="/management-access">
                        <span className="icon">
                            <FaDoorOpen/>
                        </span>
                        <span className="title">ManagementAccess</span>
                    </Link>
                </li>
                <li>
                    <Link to="/help">
                        <span className="icon">
                            <IoIosHelpCircle/>
                        </span>
                        <span className="title">Help</span>
                    </Link>
                </li>
                <li>
                    <Link to="/setting">
                        <span className="icon">
                            <IoSettings/>  
                        </span>
                        <span className="title">Setting</span>
                    </Link>
                </li>
                <li>
                    <Link to="/password">
                        <span className="icon">
                            <RiLockPasswordFill/>
                        </span>
                        <span className="title">Password</span>
                    </Link>
                </li>
                <li>
                    <Link to="/sign-out">
                        <span className="icon">
                            <FaSignOutAlt/>
                        </span>
                        <span className="title">Sign Out</span>
                    </Link>
                </li> 
            </ul>
        </div>
    );
};

export default Navigation;