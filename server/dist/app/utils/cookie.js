const setCookie = (res, key, value, options) => {
    res.cookie(key, value, options);
};
const getcookie = (req, key) => {
    return req.cookies[key];
};
const clearCookie = (res, key, options) => {
    res.clearCookie(key, options);
};
export const cookieUtils = {
    setCookie,
    getcookie,
    clearCookie
};
