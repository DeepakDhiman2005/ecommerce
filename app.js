// React Server api
import http from "http";
import express from "express";
import cors from "cors";
import multer from "multer";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const server = http.createServer(app);

const port = 8000 || process.env.PORT;

app.use(express.json());
app.use(cors());

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
    email: String,
    password: String,
    name: String,
    phone: String,
    company: String
});

const connect = mongoose.model("contacts", contactSchema);

app.get("/", (req, res)=>{res.send({message: "Hello world!"})});

const upload = multer({ dest: undefined });

app.post("/register", upload.single("file"), (req, res)=>{
    // console.log(req.body);
    const contact = new connect(req.body);
    const data = contact.save();
    // console.log(data); // promise return

    res.send({ message: "Data Submit Successfully!" });
});

app.get("/products", (req, res)=>{
    const data = fs.readdirSync(Dirname+'/Products');
    // console.log(data);
    const json_array = [];

    data.forEach((value)=>{
        const content = fs.readFileSync(Dirname+'/Products/'+value, "utf-8");
        // console.log(content);
        json_array.push(JSON.parse(content));
    });
    res.send(json_array);
});

server.listen(port, ()=>console.log("Server running..."));
