import express from "express";

const app = express();
const port = 3000;

function authenticateUser(req, res, next) {
    req.username = (req.get("X-Username")===undefined ? null : req.get("X-Username"));
    next();
};

async function validateJson(req, res, next) {
    const bodyBytes = [];
    req.on("data", chunk => bodyBytes.push(...chunk));
    req.on("end", () => {
        try {
            req.body = JSON.parse(String.fromCharCode(...bodyBytes));
            if (!Array.isArray(req.body)) {
                throw new Error("The POST body was not a JSON array.");
            }
            else if (req.body.some((element) => (typeof element)!=="string")) {
                throw new Error("The array contains non-string elements.");
            }
            next();
        }
        catch (error) {
            next(error);
        }
    });
}

function errorHandler(err, req, res, next) {
    res.status(400).send(err.message+"\n");
}

app.use(authenticateUser);
app.use(validateJson);
app.use(errorHandler);

app.post('/', (req, res) => {
    let len = req.body.length;
    res.send(`${req.username==null ? "You are not authenticated." : "You are authenticated as "+req.username+"."}\n\nYou have requested information about ${len} subject${len==1 ? "" : "s"}${len==0 ? "" : ": "}${req.body.join(", ")}.\n`);
});

app.listen(port);