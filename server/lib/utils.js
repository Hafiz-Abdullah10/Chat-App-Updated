import jwt from 'jsonwebtoken';

// Generate Token for User

export const generateToken = (userId)=>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET);
    return token;
}