import jwt from "jsonwebtoken";

const adminAuth = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token

    if (!token) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded.isAdmin);
        if (!decoded.isAdmin) {
            return res.status(403).json({ error: "Access denied. Not an admin." });
        }
        req.admin = decoded;
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token." });
    }
};

export default adminAuth;
