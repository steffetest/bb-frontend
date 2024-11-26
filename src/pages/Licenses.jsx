import React, { useState } from 'react';
import axios from 'axios';

export const Licenses = () => {
  const [driversLicense, setDriversLicense] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchDriversLicense = async () => {
    setLoading(true); // Show loading while fetching
    setErrorMessage("");
    
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const response = await axios.get(`${BACKEND_URL}/api/v1/auth/getDriversLicense`, config);

      if (response.data.success) {
        setDriversLicense(response.data.data);
      } else {
        setDriversLicense(null);
        setErrorMessage(response.data.message || "No driver's license has been added");
      }

    } catch (error) {
      setDriversLicense(null);
      setErrorMessage(
        error.response?.data?.message || "An error occurred while fetching the driver's license"
      );
    } finally {
      setLoading(false); // Hide loading after fetch
    }
  };

  return (
    <div className='container flex flex-column'>
      <h1 className='pageheader'>Licences</h1>
      <button onClick={fetchDriversLicense}>Drivers License</button>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {driversLicense ? (
            <div>
              <h2>Driver's License Details</h2>
              <p>Name: {driversLicense.name}</p>
              <p>Last Name: {driversLicense.lastName}</p>
              <p>Birthdate: {new Date(driversLicense.birthdate).toLocaleDateString()}</p>
              <p>License Type: {driversLicense.licenseType}</p>
            </div>
          ) : (
            <p>{errorMessage}</p>
          )}
        </>
      )}
    </div>
  );
};