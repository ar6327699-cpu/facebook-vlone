const express = require('express');
const cookieParser = require('cookie-parser')
const cors = require('cors');
const connectDb = require('./config/db');
require('dotenv').config()
const authRoute = require('./routes/authRoute')
const postRoute = require('./routes/postRoute')
const userRoute = require('./routes/userRoute');
const passport = require('./controllers/googleController');

const http = require('http');
const socketHandler = require('./utils/socketHandler');
const chatRoute = require('./routes/chatRoute');

const app = express()
const server = http.createServer(app);
socketHandler(server);

// Large files (videos) ke liye JSON limit badhai — 50MB
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))
app.use(cookieParser())

const corsOptions = {
    origin: process.env.FRONTEND_URL,
    credentials: true,
}
app.use(cors(corsOptions))

connectDb()
app.use(passport.initialize())

//api route
app.use('/auth', authRoute)
app.use('/users', postRoute)
app.use('/users', userRoute)
app.use('/chat', chatRoute)

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
    console.log(`server listening on ${PORT}`)

    // Badi videos ke liye timeout 10 minutes kar do
    // Default sirf 2 min hota hai — large videos fail ho jati thin
    server.timeout = 10 * 60 * 1000; // 10 minutes
})