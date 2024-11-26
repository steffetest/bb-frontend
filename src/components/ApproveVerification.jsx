import React, { useState } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Import useParams
import { approveLicenseVerification, declineLicenseVerification } from '../services/HttpClient';
import { getVerificationStatus, recordVerification } from '../services/BlockchainServices';
import { ethers } from 'ethers';

const ApproveVerification = () => {
  const { requestId } = useParams();  // Get requestId from URL parameters
  const location = useLocation();  // Get location object
  const notification = location.state?.notification; // Access notification from state
  const [statusMessage, setStatusMessage] = useState("");

  const handleAccept = async () => {
    try {
      // Send additional license details in the request
      const response = await approveLicenseVerification(requestId, {
        lastName: notification.lastName,
        licenseType: notification.licenseType
      });
      
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || "An error occurred during approval.");
    }
  };

  const handleDecline = async () => {
    try {
      const response = await declineLicenseVerification(requestId);  // Pass requestId here
      setStatusMessage(response.message);
    } catch (error) {
      setStatusMessage(error.response?.data?.error || "An error occurred during approval.");
    }
  };
  

const handleVerification = async () => {
  try {
    // Check if MetaMask is installed
    if (!window.ethereum) {
      setStatusMessage("MetaMask is not installed. Please install it to use this feature.");
      return;
    }

    // Request account access and get the currently connected wallet address
    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const userAddress = accounts[0]; // The first account connected to MetaMask

    // Record verification with the dynamic user address
    const transactionHash  = await recordVerification({
      requestId,
      userAddress,
      licenseType: notification.licenseType,
      isVerified: true,
    });

    setStatusMessage(`Verification recorded successfully. Transaction Hash: ${transactionHash}`);
  } catch (error) {
    // Handle errors gracefully
    if (error.response && error.response.data && error.response.data.error) {
      const fullErrorMessage = error.response.data.error;

      const reasonMatch = fullErrorMessage.match(/reason="(.+?)"/);
      if (reasonMatch && reasonMatch[1]) {
        setStatusMessage(`Verification failed: ${reasonMatch[1]}`);
      } else {
        setStatusMessage("Verification failed: Unknown error.");
      }
    } else {
      setStatusMessage("Verification failed: Unknown error.");
    }
  }
};

const checkStatus = async () => {
  try {
    const status = await getVerificationStatus(requestId);

    const formattedDate = new Date(Number(status.timestamp) * 1000).toLocaleString();
    
    setStatusMessage(`
      Status: ${status.isVerified ? "Verified" : "Not Verified"}
      License Type: ${status.licenseType}
      Timestamp: ${formattedDate}
      User Address: ${status.userAddress}
    `);
  } catch (error) {
    console.error("Error retrieving status:", error);
    setStatusMessage("Failed to retrieve verification status.");
  }
};

  return (
    <div className='container flex flex-column'>
      <h2 className='pageheader'>{notification?.message}</h2>
      <button onClick={handleAccept}>Accept Verification</button>
      <button onClick={handleDecline}>Decline Verification</button>
      <button onClick={handleVerification}>Record Verification on Blockchain</button>
      <button onClick={checkStatus}>Check Verification Status on Blockchain</button>
      {statusMessage && <p className='statusmessage'>{statusMessage}</p>}
    </div>
  );
};

export default ApproveVerification;