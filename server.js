const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const ErrorHandler = require('./utils/ErrorHandler');
const { generatedError } = require('./middleware/error');
const fileUpload = require('express-fileupload');

// Load environment variables from .env file
dotenv.config();

const app = express(); // ✅ Initialize app first
const port = process.env.PORT || 5000;

// Enable file uploads
app.use(fileUpload()); // ✅ Move this below app initialization



// Logger
app.use(logger('tiny'));

// CORS
const corsOptions = {
    origin: 'http://127.0.0.1:3000', // ✅ No trailing slash "/"
    credentials: true,
    optionSuccessStatus: 200,
    methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsOptions));


// Body parser
app.use(express.json({ limit: "50mb" })); // Increase JSON payload limit
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json());
app.use('/api/v1/uploads', express.static('uploads'));

// Cookie parser
app.use(cookieParser());

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require("./routes/productRoutes"); 
const cartRoutes = require("./routes/cartRoutes");
const varientsRoutes = require("./routes/variantRoutes");
const orderRoutes = require("./routes/orderRoutes");
const addressRoutes = require("./routes/addressRoutes");
const contactRoutes = require("./routes/contactRoutes");

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use("/api/v1/variants", varientsRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/contacts", contactRoutes);

// Error handling
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`Requested URL Not Found ${req.url}`, 404));
});
app.use(generatedError);

// Connect to the database and start the server
connectDB().then(() => {
    app.listen(port, () => {
        console.log(`Server listening at port ${port}`);
    });
}).catch(error => {
    console.error('Failed to connect to the database:', error);
});