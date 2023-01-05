const express = require("express");
const path = require("path");
const hbs = require("hbs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const PORT = 3000;
const app = express();
const templatePath = path.join(__dirname, "../templates");

//MODELS
const User = require("./models/user");

app.use(express.json());
app.set("view engine", "hbs");
app.set("views", templatePath);
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.post("/login", async(req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        // Checking if user exists
        if (!user) {
            return res.render("error", {
                message: "User not found :(",
            });
        }
        //Checking password
        if (user.password !== password) {
            return res.render("error", {
                message: "Wrong Password. Did you forget?",
            });
        }
        res.render("main", {
            auth: true,
        });
    } catch (error) {
        console.log({ error });
        res.render("error", {
            message: error.message,
        });
    }
});

app.post("/signup", async(req, res) => {
    console.log(req.body);
    const { name, email, password, confirmPassword } = req.body;
    try {
        // Checking if user already exists
        const userDoc = await User.findOne({ email });
        if (password !== confirmPassword) {
            return res.render("error", {
                message: "Passwords do not match",
            });
        }
        if (userDoc) {
            return res.render("error", {
                message: "User Already Exists!",
            });
        }
        const user = new User({ name, email, password });
        const newUser = await user.save();
        res.render("login", {
            auth: true,
        });
    } catch (error) {
        console.log({ error });
        res.render("error", {
            message: error.message,
        });
    }
});

app.get("*", (req, res) => {
    res.render("error", {
        message: "Wrong URL",
    });
});

mongoose.set("strictQuery", false);
mongoose
    .connect("mongodb://localhost:27017/DeadTargetDatabase", { useNewUrlParser: true })
    .then(() => {
        console.log("mongodb connected");
        const server = app.listen(PORT, () => {
            console.log(`Server Started 💚 at http://localhost:3000`);
        });
    })
    .catch((error) => {
        console.log("Failed to connect to MongoDB.\n", { error });
    });