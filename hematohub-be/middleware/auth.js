import jwt from "jsonwebtoken";

// Donor Authentication Middleware
export const authenticateDonor = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.donor = verified; // Attach donor data to request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};

// Hospital Authentication Middleware
export const authenticateHospital = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied. No token provided." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.hospital = verified; // Attach hospital data to request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid token" });
  }
};



