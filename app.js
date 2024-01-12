// React Server api
import http from "http";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

const port = 8000 || process.env.PORT;

app.use(express.json());
app.use(cors({
    origin: "*"
}));

// path
const Url = import.meta.url;
const Path = fileURLToPath(Url);
const Dirname = path.dirname(Path);
// console.log(Dirname);

// mongodb connection
// mongodb+srv://ProgrammerD:<password>@cluster0.tnmxvha.mongodb.net/?retryWrites=true&w=majority
const Database_Url = "mongodb+srv://ProgrammerD:deepak8339@cluster0.tnmxvha.mongodb.net/reactdata?retryWrites=true&w=majority";
mongoose.connect(Database_Url);

const contactSchema = new mongoose.Schema({
    username: String,
    gmail: String,
    message: String
});

const registerSchema = new mongoose.Schema({
    email: String,
    password: String,
    name: String,
    phoneno: Number,
    company: String
})

const ConnectContact = mongoose.model("contacts", contactSchema);
const ConnectRegister = mongoose.model("registers", registerSchema);

app.get("/", (req, res)=>{res.send({message: "Hello world!"})});

const upload = multer({ dest: undefined });

// --------------------------------------- middleware ------------------------------------------
const LoginMeddleWare = async (req, res, next) => {
    // console.log("call in middleware...");
    // console.log(req.body);

    // console.log(password); 
    const data = await ConnectRegister.findOne({email: req.body.email});
    // console.log(data)

    if(data){
        let cpassword = await bcrypt.compare(req.body.password, data.password);
        // console.log(cpassword)
        if(cpassword){
            next();
        }
    }
    // next();
}

// ---------------------------------- get and post methods ---------------------------------------
// Register
app.post("/register", upload.single("file"), async (req, res)=>{
    // console.log(req.body);
    let { email, password, name, phone, company } = req.body;
    // console.log(email, password, name, phone, company);

    let message = "";

    const data = await ConnectRegister.findOne({email: email, phoneno: phone});
    // console.log(data);
    if(data){
        message = true;
    }else{
        let hash_password = await bcrypt.hash(password, 12);

        const register = new ConnectRegister({
            email: email,
            password: hash_password,
            name: name,
            phoneno: phone,
            company: company
        });
        const data = await register.save();
        // console.log(data); // promise return
        message = true;
    }

    res.send({ message: message });
});

// Login
app.post("/login", LoginMeddleWare, async (req, res)=>{
    // console.log(req.body);
    const data = await ConnectRegister.findOne({email: req.body.email});
    const {email, name, phoneno, company} = data;

    res.send({email: email, name: name, phoneno: phoneno, company: company});
})

// Products
const data = fs.readdirSync(Dirname+'/Products');
// console.log(data);
const json_array = [];

data.forEach((value)=>{
    const content = fs.readFileSync(Dirname+'/Products/'+value, "utf-8");
    // console.log(content);
    json_array.push(JSON.parse(content));
});

app.get("/products", (req, res)=>{
    res.send(json_array);
});

// Contact
app.post("/contact", upload.single('file'), (req, res)=>{
    // console.log(req.body);
    const contact = new ConnectContact(req.body);
    contact.save();
    res.send({message: "contact us successfully!"})
})

// ----------------------------------- Server Listen ----------------------------
server.listen(port, ()=>console.log("Server running..."));
