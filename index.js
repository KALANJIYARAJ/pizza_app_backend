const express = require("express");
const cors = require("cors");
const app = express();
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const URL = process.env.DB;
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");


app.use(
  cors({
    orgin:"http://localhost:3000",
  })
);

app.use(express.json());

let account = [];

app.post("/user/register", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    //hash
    var salt = await bcrypt.genSalt(10); //$2b$10$TuImFpJf327l0XDn5.Ropu
    var hash = await bcrypt.hash(req.body.password, salt); //$2b$10$h0vKL1wJUpyhf0Q2EHPbcuzeih1kCX7c891uS70nB5FFjRkBSaDHC
    // console.log(hash);

    req.body.password = hash;

    const user = await db.collection("users").insertOne(req.body);
    await connection.close();
    res.json({ message: "user created" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/login", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
      await connection.close();
      console.log(user.email);
    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        const token = jwt.sign({_id:user._id},JWT_SECRET,{expiresIn:"2m"})
        if(user.user_type == "admin"){
          res.json({ message: "admin"});
      }else{
        res.json({ message: "user"})
      }
        
      } else {
        res.json({ message: "username or password incorrect" });
      }
    }else{
      res.json({ message: "username or password incorrect" });
    }
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
});

//create_Pizza
app.post("/pizza", async (req, res) => {
    try {
      const connection = await mongoclient.connect(URL);
      const db = connection.db("pizza_application");
      const user = await db.collection("pizzas").insertOne(req.body);
      await connection.close();
      res.json({ message: "pizza created" });
    } catch (error) {
      res.status(500).json({ message: "Something went wrong for pizza creation" });
    }
  });

//get_pizza
app.get("/pizzas", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const pizzas = await db.collection("pizzas").find({}).toArray();
    await connection.close();
    res.json(pizzas);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for user creation" });
  }
});

//update_pizza
app.post("/pizza/pId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const user = await db.collection("pizzas").updatetOne(req.body);
    await connection.close();
    res.json({ message: "pizza created" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for pizza creation" });
  }
});




app.listen(process.env.PORT || 3003);