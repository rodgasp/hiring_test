import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import axios from 'axios';
import styles from './Login.module.css';

const Login = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const navigate = useNavigate();

  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        await window.ethereum.request({
          method: 'wallet_requestPermissions',
          params: [{ eth_accounts: {} }],
        });
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        setWalletAddress(address);
        
        localStorage.setItem('token', 'metamask_' + address);
        localStorage.setItem('userID', address);
        onLogin();
        navigate('/play');
      } else {
        setError('Please install MetaMask!');
      }
    } catch (err) {
      setError(`Failed to connect to MetaMask: ${err.message}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5005/api/users/login', formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userID', response.data.userID);
      onLogin();
      navigate('/play');
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError('User not found. Please register first.');
      } else {
        setError(error.response?.data.message || 'Error logging in');
      }
    }
  };

  const handleRegisterRedirect = () => {
    navigate('/register');
  };

  return (
    <div className={styles.wrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Welcome Back</h2>
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={styles.input}
        />
        <div className={styles.buttonGroup}>
          <button type="submit" className={`${styles.button} ${styles.loginButton}`}>
            Login
          </button>
          <button type="button" onClick={handleRegisterRedirect} className={`${styles.button} ${styles.registerButton}`}>
            Register
          </button>
        </div>
        <br />
        <button type="button" onClick={connectWallet} className={`${styles.button} ${styles.metamaskButton}`} style={{ width: '100%' }}>
          MetaMask Auth
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

Login.propTypes = {
  onLogin: PropTypes.func.isRequired
};

export default Login;