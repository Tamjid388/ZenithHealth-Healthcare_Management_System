import status from "http-status";
export const hadnleZodError = (err) => {
    const statusCode = status.BAD_REQUEST;
    const message = "Zod Validation Error";
    let errorSource = [];
    err.issues.forEach(issue => {
        errorSource.push({
            path: issue.path.join("=>") || "unknown",
            message: issue.message
        });
    });
    return {
        success: false,
        message,
        errorSource,
        statusCode
    };
};
