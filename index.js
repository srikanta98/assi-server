//14 num porjonto firt step
const express = require('express');

const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

const app = express();

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.v9vbj.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        // const serviceCollection = client.db('geniusCar').collection('service');
        const orderCollection = client.db('geniusCar').collection('order');
        const inventoryCollection = client.db('Assi').collection('inventory');

        // AUTH
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })

        // SERVICES API
        // app.get('/service', async (req, res) => {
        //     const query = {};
        //     const cursor = serviceCollection.find(query);
        //     const services = await cursor.toArray();
        //     res.send(services);
        // });

        // app.get('/service/:id', async (req, res) => {
        //     const id = req.params.id;
        //     console.log(id);
        //     const query = { _id: ObjectId(id) };
        //     const service = await serviceCollection.findOne(query);
        //     res.send(service);
        // });
        //inventory
        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = inventoryCollection.find(query);
            const inventoryes = await cursor.toArray();
            res.send(inventoryes);
        });
        app.post('/inventory', async (req, res) => {
            const newService = req.body;
            const result = await inventoryCollection.insertOne(newService);
            res.send(result);
        });
        app.get('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const inventory = await inventoryCollection.findOne(query);
            res.send(inventory);
        });

        // POST
        // app.post('/service', async (req, res) => {
        //     const newService = req.body;
        //     const result = await serviceCollection.insertOne(newService);
        //     res.send(result);
        // });

        // DELETE
        // app.delete('/service/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await serviceCollection.deleteOne(query);
        //     res.send(result);
        // });
        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });
        app.put('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            const user = req.body
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedDoc = {
                        $set: {
                            price: user.newProduct,
                            
                        },
                    };
            const result = await user.updateOne(filter, updatedDoc, options);
                   
            res.send(result);
        });
        // app.put('/inventory/:id', async(req, res) =>{
        //     const id = req.params.id;
        //     const updatedUser = req.body;
        //     const filter = {_id: ObjectId(id)};
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: {
        //             name: updatedUser.name,
        //             email: updatedUser.email,
        //             number: updatedUser.number
        //         }
        //     };
        //     const result = await userCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result);

        // Order Collection API

        app.get('/order', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const cursor = orderCollection.find(query);
                const orders = await cursor.toArray();
                res.send(orders);
            }
            else{
                res.status(403).send({message: 'forbidden access'})
            }
        })

        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await inventoryCollection.deleteOne(query);
            res.send(result);
        });

    }
    finally {

    }
}


run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running Genius Serveriiii');
});

// app.get('/hero', (req, res) =>{
//     res.send('Hero meets hero ku')
// })

app.listen(port, () => {
    console.log('Listening to port', port);
})