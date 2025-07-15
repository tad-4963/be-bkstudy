export const adminAuthMiddleware = (req, res, next) => {
    const user = req?.user;
    if(!user) {
        return res.status(401).json({ message: 'User not logged in' });
    }

    const role = user?.role;
    if(role !== "Admin") {
        return res.status(403).json({ message: 'You are not authorized to perform this action' });
    }

    next();
}