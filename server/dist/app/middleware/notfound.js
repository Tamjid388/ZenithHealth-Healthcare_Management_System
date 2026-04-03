import status from "http-status";
const notFound = (req, res, next) => {
    res.status(status.NOT_FOUND).json({
        success: false,
        message: "Not Found",
        error: `${req.originalUrl} is not found`
    });
};
export default notFound;
