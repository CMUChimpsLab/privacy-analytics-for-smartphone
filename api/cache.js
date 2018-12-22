var cache = () => {
    var cachedBody = {};
    return (req, res, next) => {
        let key = '__express__' + (req.originalUrl || req.url) + `${JSON.stringify(req.params)}` + `${JSON.stringify(req.query)}` + `${JSON.stringify(req.body)}`;
        if (cachedBody[key]) {
            res.send(cachedBody[key]);
            return
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                cachedBody[key] = body;
                res.sendResponse(body)
            }
            next()
        }
    }
}
exports.cache = cache;