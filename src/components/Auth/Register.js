import React from 'react';
import './login.css';
import { Link, useNavigate } from 'react-router-dom';
import { FaFacebookF } from "react-icons/fa";
import { CiTwitter } from "react-icons/ci";
import { FaInstagram } from "react-icons/fa";
import axios from 'axios';

const LoginForm = () => {
    const serverUrl = process.env.REACT_APP_SERVER_URL;
    const[isLoading,setIsLoading]= React.useState(false);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        const confirmpassword = e.target.confirmpassword.value;
        console.log('email', email);
        console.log('Password:', password);
        console.log('Confirm Password:', confirmpassword);
        if (password !== confirmpassword) {
            window.FuiToast.error('confirm password is not same as password');
            return;
        }
        if (!email || !password || !confirmpassword) {
            window.FuiToast.error('Please fill all fields');
            return;
        }
        //use asynchronous function to send a POST request to the server

        console.log('serverUrl', serverUrl);

        console.log("start send request");
        try {
            const result = await axios.post(`${serverUrl}/users/register`, {
                email,
                password,
            });
            console.log('Response:', result);
            if (result.status === 201) {
                window.FuiToast.success('Registration successful');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                window.FuiToast.error(result.data.message || 'Registration failed');
            }
        } catch (error) {
            window.FuiToast.error('An error occurred during registration');
            console.error(error);
        };



    }
    return (
        <form className='register-form auth-form' onSubmit={handleSubmit}>
            <h3>Register</h3>

            <label htmlFor="email">Email</label>
            <input type="text" placeholder="Email or Phone" id="email" />

            <label htmlFor="password">Password</label>
            <input type="password" placeholder="Password" id="password" />

            <label htmlFor="password">Confirm Password</label>
            <input type="password" placeholder='Confirm Password' id="confirmpassword" />
            <p>Already have an account? <Link to="/login" style={{ textDecoration: 'none' }}><b>Login</b></Link></p>
            <button type="submit">Signup</button>
            <p className="social-text">Login with a social media account</p>
            <div className="social-icons">
                <button className="social-icon fb"><FaFacebookF /></button>
                <button className="social-icon tw"><CiTwitter /></button>
                <button className="social-icon in"><FaInstagram /></button>
            </div>
            {isLoading&&
            <div>
            </div>}
        </form>
    );
};

export default LoginForm;