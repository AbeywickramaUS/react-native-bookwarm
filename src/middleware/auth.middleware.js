import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Removed invalid fetch statement; if needed, use the following correct syntax:
//const response = await fetch('https://localhost:3000/api/book', {
//    method: 'POST',
//    body: JSON.stringify({
//        title: 'New Book',
//        caption: 'A captivating new book',
//    }),
//    headers: { authorization: `Bearer ${token}` }
//});

const protectRoute = async (req, res, next) => {
    try {
        //get token from the authorization header
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
            return res.status(401).json({ message: 'No token provided, authorization denied' });
        }
    // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //find the user by ID from the decoded token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found, authorization denied' });
        }

        req.user = user; // Attach user to the request object

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({ message: 'Token is not valid, authorization denied' });
    }
}

export default protectRoute;
// This middleware can be used in your routes to protect them