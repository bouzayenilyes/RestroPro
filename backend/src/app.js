require("dotenv").config({});

const express = require("express");
const i18n = require('i18n');
const morgan = require("morgan");
const {rateLimit} = require("express-rate-limit");
const cors = require("cors");
// const path = require("path")
// const rfs = require("rotating-file-stream");
const cookieParser = require("cookie-parser");
const userAgent = require('express-useragent');
const { CONFIG, LANGUAGES } = require("./config");
const fileUpload = require("express-fileupload")
const path = require("path")

// routes import
const authRoutes = require("./routes/auth.routes");
const settingsRoutes = require("./routes/settings.routes");
const customerRoutes = require("./routes/customer.routes");
const reservationRoutes = require("./routes/reservation.routes");
const userRoutes = require("./routes/user.routes");
const menuItemRoutes = require("./routes/menu_item.routes");
const posRoutes = require("./routes/pos.routes");
const kitchenRoutes = require("./routes/kitchen.routes")
const ordersRoutes = require("./routes/orders.routes")
const invoiceRoutes = require("./routes/invoice.routes")
const dashboardRoutes = require("./routes/dashboard.routes")
const reportsRoutes = require("./routes/reports.routes")
const qrMenuRoutes = require("./routes/qrmenu.routes")
const feedbackRoutes = require("./routes/feedback.routes")
const superAdminRoutes = require("./routes/superadmin.routes")
const inventoryRoutes = require("./routes/inventory.routes");
// routes import


const app = express();

/**
 * Middlewares
 * */
// create write stream for logs
// const accessLogStream = rfs.createStream("access.log", {
//   interval: '1d',
//   path: path.join(__dirname, '../log')
// })

// const limiter = rateLimit({
//   max: 1000,
//   windowMs: 60000,
//   legacyHeaders: false,
//   standardHeaders: true,
//   message: "You exceeded limits! hold on",
// });


var corsWhitelist = [
  CONFIG.FRONTEND_DOMAIN,
];

var corsOptions = {
  credentials: true,
  origin: function (origin, callback) {
    if (corsWhitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

i18n.configure({
  locales: LANGUAGES,
  directory: path.join(__dirname, '../translations' , 'locales'),
  defaultLocale: 'en',
  cookie: 'lang',
  queryParameter: 'lang',
});

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(i18n.init);
app.use(userAgent.express());
app.use('/api/v1/auth/stripe-webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
// app.use(morgan("combined", {stream: accessLogStream}));
app.use(fileUpload({
  preserveExtension: true,
  safeFileNames: true,
  useTempFiles: true,
  tempFileDir: path.join(__dirname, "../tmp")
}))
app.use("/public", express.static(path.join(__dirname, "../public")))
app.use(morgan("tiny"));
// app.use(limiter);
/**
 * Middlewares
 * */


// routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/settings", settingsRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/reservations", reservationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/menu-items", menuItemRoutes);
app.use("/api/v1/pos", posRoutes);
app.use("/api/v1/kitchen", kitchenRoutes);
app.use("/api/v1/orders", ordersRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/qrmenu", qrMenuRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/superadmin", superAdminRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
// routes

app.get("/", (req, res)=>{
  res.send("⚡️");
});


module.exports = app;
