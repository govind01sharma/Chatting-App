import jwt from "jsonwebtoken";
export const generateToken = (userId, res) => {

    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "7d",
    });

    res.cookie("jwt", token, {
        httpOnly: true, //prevent XXS attacks cross-site scripting attacks
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "strict", //CSRF attacks crosss-site request forgery attacks
        secure: process.env.NODE_ENV !== "development",
    });

    return token;
}