const express = require("express");
const app = express();
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const URL = "mongodb+srv://admin:admin123@cluster0.zfkqxf5.mongodb.net/?retryWrites=true&w=majority";  //process.env.DB;


app.use(
    cors({
      orgin:"http://localhost:3000",
    })
  );

  
app.use(express.json());

//register_users
app.post("/user", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const user = await db.collection("users").insertOne(req.body);
    await connection.close();
    res.json({ message: "user created" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong for user creation" });
  }
});

//get_users
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

//update_users
app.put("/user/:id", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");
    const userData = await db
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    if (userData) {
      //select the Collection
      //Do operation (CRUD)
      delete req.body._id
      const user = await db
        .collection("users")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.id) },
          { $set: req.body }
        );

      //close the connection
      await connection.close();

      res.json(user);
    } else {
      res.status(404).json({ message: "User can't Update" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.get("/user/:id", async (req, res) => {
  try {
    //connect the Database
    const connection = await mongoclient.connect(URL);

    //select the DB
    const db = connection.db("pizza_application");

    //select the Collection
    //Do operation (CRUD)
    const userData = await db
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    //close the connection
    await connection.close();

    if (userData) {
      res.json(userData);
    } else {
      res.status(404).json({ message: "User Not Found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
  
});

app.delete("/user/:id", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("pizza_application");

    const productData = await db
      .collection("users")
      .findOne({ _id: mongodb.ObjectId(req.params.id) });

    if (productData) {
      const product = await db
        .collection("users")
        .deleteOne({ _id: mongodb.ObjectId(req.params.id) });
      await connection.close();
      res.json(product);
    } else {
      res.status(404).json({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
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