import React from 'react';
import './login.css';
import { FaFacebookF } from "react-icons/fa";
import { CiTwitter } from "react-icons/ci";
import { FaInstagram } from "react-icons/fa";
import { Link,useNavigate } from 'react-router-dom';
const LoginForm = () => {
    const[username,setUsername]= React.useState('');
    const[userId, setUserId]= React.useState('');
    const navigate = useNavigate();
    const urlServer = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch(`${urlServer}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            if(!email || !password) {
                window.FuiToast.error('Please fill all fields');
                return;
            }   
            if (response.status !== 200) {
                window.FuiToast.error('Login failed');
                localStorage.setItem('isAuth',false);
                return;
            }else{
                window.FuiToast.success('Login successful');
                localStorage.setItem('username', email);
                localStorage.setItem('isAuth',true);
                setTimeout(() => {
                    navigate('/dashboard');
                }, 0);
            }

            const data = await response.json();
            console.log('Login successful:', data);
            localStorage.setItem('userId', data.userId);
        } catch (error) {
            localStorage.setItem('isAuth',false);
            console.error('Error:', error.message);
        }
    };
    return (
        <form className='auth-form' onSubmit={handleSubmit}>
            <h3>Login Here</h3>

            <label htmlFor="email">Email</label>
            <input type="text" placeholder="Email or Phone" id="email" />

            <label htmlFor="password">Password</label>
            <input type="password" placeholder="Password" id="password" />
            {/* forgot password */}
            <p style={{marginBottom: '10px'}}><Link to="/password" style={{textDecoration: 'none'}}>Forgot Password?</Link></p>
            <p>Don't have an account? <Link to="/register" style={{textDecoration: 'none'}}><b>Register</b></Link></p>
            <button type="submit">Login</button>
            <p className="social-text">Login with a social media account</p>
            <div className="social-icons">
                <button className="social-icon fb"><FaFacebookF /></button>
                <button className="social-icon tw"><CiTwitter /></button>
                <button className="social-icon in"><FaInstagram /></button>
            </div>
        </form>
    );
};

export default LoginForm;