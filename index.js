const express = require("express");
const router = require('./roleGroup.route');
const bodyParser = require('body-parser');
const app = express()
const port = 8000
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(require('./roleGroup.route'))

app.use("/api", router);

// router(app)

app.listen(port, () => {
    console.log(`server is running with port: ${port}`)
})