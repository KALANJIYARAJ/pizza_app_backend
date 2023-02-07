const express = require("express");
const cors = require("cors");
const app = express();
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const dotenv = require("dotenv").config();
const URL = process.env.DB;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const nodemailer = require("nodemailer");
const EMAIL = process.env.EMAIL;
const PASSWORD = process.env.PASSWORD;

app.use(
  cors({
    orgin: "https://brilliant-custard-f8013a.netlify.app",
  })
);

app.use(express.json());

let account = [];

//create_user
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

//user-login
app.post("/login", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
    await connection.close();
    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
          expiresIn: "10m",
        });
        delete user.password;
        res.json({ message: "login successfully", token, user });
      } else {
        res.json({ message: "username or password incorrect" });
      }
    } else {
      res.json({ message: "username or password incorrect" });
    }
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
});

//sent msg to register email id
app.post("/forgot", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
    await connection.close();

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL,
        pass: PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    var mailOptions = {
      from: EMAIL,
      to: user.email,
      subject: "Rest Password",
      text: "Hi Raj",
      html: `<h1>Hiii ${user.name} <a href="https://brilliant-custard-f8013a.netlify.app/reset/${user._id}">please click the link and reset your password</a> </h1>`,
    };
    transporter.sendMail(mailOptions, function (error, response) {
      if (error) {
        console.log(error);
        return;
      }
      transporter.close();
    });

    res.json({ message: "Message sent" });
  } catch (error) {
    res.status(400).send({ sucess: false, msg: error.message });
  }
});

//update password from link
app.post("/reset/:userId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    var salt = await bcrypt.genSalt(10);
    var hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;

    const user = await db
      .collection("users")
      .updateOne(
        { _id: mongodb.ObjectId(req.params.userId) },
        { $set: { password: req.body.password } }
      );
    await connection.close();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
});

app.get("/user/:userId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const user = await db
      .collection("users")
      .find({ _id: mongodb.ObjectId(req.params.userId) })
      .toArray();
    await connection.close();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for get user" });
  }
});

//get users
app.get("/users", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const users = await db.collection("users").find({}).toArray();
    await connection.close();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for user creation" });
  }
});

//edit user
app.post("/edituser/:userId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const user = await db
      .collection("users")
      .updateOne(
        { _id: mongodb.ObjectId(req.params.userId) },
        { $set: req.body }
      );
    await connection.close();
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
});

//delete user
app.delete("/deleteuser/:userId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const user = await db
      .collection("users")
      .deleteOne({ _id: mongodb.ObjectId(req.params.userId) });
    await connection.close();
    res.json({ message: "user delete successfully" });
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
    res
      .status(500)
      .json({ message: "Something went wrong for pizza creation" });
  }
});

//get_pizzas
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

//get_pizza
app.get("/pizza/:pizzaId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const pizza = await db
      .collection("pizzas")
      .find({ _id: mongodb.ObjectId(req.params.pizzaId) })
      .toArray();
    await connection.close();
    res.json(pizza);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for get user" });
  }
});

//update_pizza
app.post("/editpizza/:pizzaId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const pizza = await db
      .collection("pizzas")
      .updateOne(
        { _id: mongodb.ObjectId(req.params.pizzaId) },
        { $set: req.body }
      );
    await connection.close();
    res.json(pizza);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong for pizza updation" });
  }
});

//update_stock
app.post("/stock/:pizzaId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const pizzaStock = await db
      .collection("pizzas")
      .updateOne(
        { _id: mongodb.ObjectId(req.params.pizzaId) },
        { $inc: { stock: req.body.number } }
      );
    await connection.close();
    res.status(201).json(pizzaStock);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong for stock updation" });
  }
});

//delete_pizza
app.delete("/deletepizza/:pizzaId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const pizza = await db
      .collection("pizzas")
      .deleteOne({ _id: mongodb.ObjectId(req.params.pizzaId) });
    await connection.close();
    res.json(pizza);
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
});

//create veggies and meats
app.post("/veggies_meats", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const veggies_meats = await db
      .collection("veggies_meats")
      .insertOne(req.body);
    await connection.close();
    res.json({ message: "veggies_meats created" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong for pizza creation" });
  }
});

//get veggies and meats
app.get("/veggies_meats", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const veggies_meats = await db
      .collection("veggies_meats")
      .find({})
      .toArray();
    await connection.close();
    res.json(veggies_meats);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for user creation" });
  }
});

//get_vm
app.get("/vm/:vmId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const vm = await db
      .collection("veggies_meats")
      .find({ _id: mongodb.ObjectId(req.params.vmId) })
      .toArray();
    await connection.close();
    res.json(vm);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for get user" });
  }
});

//update_veggies and meats
app.post("/editvm/:vmId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const vm = await db
      .collection("veggies_meats")
      .updateOne(
        { _id: mongodb.ObjectId(req.params.vmId) },
        { $set: req.body }
      );
    await connection.close();
    res.json(vm);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong for pizza updation" });
  }
});

//delete_veggies and meats
app.delete("/deletevm/:vmId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const vm = await db
      .collection("veggies_meats")
      .deleteOne({ _id: mongodb.ObjectId(req.params.vmId) });
    await connection.close();
    res.json(vm);
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
});

//order
//post order
app.post("/order", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const order = await db.collection("order").insertOne(req.body);
    await connection.close();
    res.json({ message: "order created" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong for order creation" });
  }
});

//get orders
app.get("/orders", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const veggies_meats = await db
      .collection("order")
      .aggregate([
        {
          $unwind: {
            path: "$pizza",
          },
        },
        {
          $project: {
            _id: 1,
            name: "$name",
            email: "$email",
            phone: "$phone",
            address: "$address",
            payment_type: "$payment_type",
            pizza_name: "$pizza.pizza_name",
            pizza_size: "$pizza.size",
            add_items: "$pizza.add_items",
            total: "$total",
            order_status: 1,
            payment_status: 1,
          },
        },
      ])
      .toArray();
    await connection.close();
    res.json(veggies_meats);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for user creation" });
  }
});

//get order from user
app.get("/order/:userId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const order = await db
      .collection("order")
      .find({ user_id: req.params.userId })
      .toArray();
    await connection.close();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for get order" });
  }
});

//get order
app.get("/orders/:orderId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const order = await db
      .collection("order")
      .find({ _id: mongodb.ObjectId(req.params.orderId) })
      .toArray();
    await connection.close();
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for get order" });
  }
});

//update order
app.post("/editorder/:orderId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const order = await db.collection("order").updateOne(
      { _id: mongodb.ObjectId(req.params.orderId) },
      {
        $set: {
          payment_status: req.body.payment_status,
          order_status: req.body.order_status,
        },
      }
    );
    await connection.close();
    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong for order updation" });
  }
});

//delete order
app.delete("/deleteorder/:orderId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const order = await db
      .collection("order")
      .deleteOne({ _id: mongodb.ObjectId(req.params.orderId) });
    await connection.close();
    res.json(order);
  } catch (error) {
    res.status(400).json({ message: "Something went wrong for order delete" });
  }
});

app.put("/ordercansel/:orderId", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const order = await db
      .collection("order")
      .updateOne(
        { _id: mongodb.ObjectId(req.params.orderId) },
        { $set: { order_status: "cancel" } }
      );
    await connection.close();
    res.json(order);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Something went wrong for order updation" });
  }
});

app.listen(process.env.PORT || 3003);
