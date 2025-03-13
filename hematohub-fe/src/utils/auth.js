import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const useAutoLogout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      const logoutTime = decoded.exp; // JWT expiration time
      
      // Calculate remaining time in milliseconds
      const timeUntilLogout = (logoutTime - currentTime) * 1000;

      if (timeUntilLogout <= 0) {
        // If already expired, logout immediately
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        // Set timeout to logout exactly when the token expires
        const timeout = setTimeout(() => {
          localStorage.removeItem("token");
          navigate("/login");
        }, timeUntilLogout);

        return () => clearTimeout(timeout); // Cleanup on component unmount
      }
    }
  }, [navigate]);

};

export default useAutoLogout;
