const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const cors = require('cors');
const port = process.env.PORT || 5000;
require('dotenv').config();

//Const URI and Client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cohpt.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//App & Middleware
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//mongo connections
client.connect((err) => {
    const adminsCollection = client.db(`${process.env.DB_NAME}`).collection('admins');
    const ordersCollection = client.db(`${process.env.DB_NAME}`).collection('orders');
    const servicesCollection = client.db(`${process.env.DB_NAME}`).collection('services');
    const reviewsCollection = client.db(`${process.env.DB_NAME}`).collection('reviews');

    //API for root connection
    app.get('/', (req, res)=>{
        res.send('403 - Direct Access Denied...')
    })

    

    //API for show all services
    app.get('/allServices', (req, res) => {
        servicesCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    //API to update service status
    app.post('/updatestatus', (req, res)=>{
        // console.log(req.body);
        const updateObject = {status: req.body.status};
        const id = req.body.id;
        ordersCollection.updateOne({_id: ObjectID(id)}, {$set: updateObject})
        .then(result => {
            // console.log(result.modifiedCount);
            res.send(result.modifiedCount > 0);
        })
    })

    //API for show all reviews
    app.get('/allReviews', (req, res) => {
        reviewsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })

    })

    //API for placing orders by POST
    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    //API to make an Admin
    app.post('/makeadmin', (req, res) => {
        const data = req.body;
        console.log(data);
        adminsCollection.insertOne(data)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    //API to add services
    app.post('/addservice', (req, res)=> {
        const newService = req.body;
        servicesCollection.insertOne(newService)
        .then(result => {
            res.send(result.insertedCount > 0)
        })

    })

    //API to add reviews
    app.post('/addreview', (req, res)=> {
        const newReview = req.body;
        reviewsCollection.insertOne(newReview)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    //API to delete a service by id
    app.post('/delservice', (req, res) => {
        const id = ( req.query);
        console.log(id.id);
        servicesCollection.deleteOne({_id: ObjectID(id.id)})
        .then(result => {
            res.send(result.deletedCount > 0);
        })
    })

    //API to delete a Review by id
    app.post('/delreview', (req, res) => {
        const id = ( req.query);
        console.log(id.id);
        reviewsCollection.deleteOne({_id: ObjectID(id.id)})
        .then(result => {
            res.send(result.deletedCount > 0);
        })
    })

    //API to detect whether a user is an Admin
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        console.log(email);
        adminsCollection.find({email: email})
            .toArray((err, documents) => {
                if(documents.length === 1){
                    res.send(true)
                } else {
                    res.send(false)
                }
                // res.send(documents.length > 0)
                console.log(documents.length)
            })
    })
 
    //API for display All orders 
    app.get('/showOrders', (req, res) => {
        ordersCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
        })
    })

    //API for display all orders (filtered by user's or admin's emails)
    app.post('/showOrdersbyEmail', (req, res) => {
        const email = req.body.email;
        adminsCollection.find({email: email})
        .toArray((err, admins)=> {
            const filter = {};
            if(admins.length === 0){
                filter.email = email;
                ordersCollection.find({email: filter.email})
                .toArray((err, documents) => {
                    res.send(documents);
                })
            }
            if(admins.length){
                ordersCollection.find({})
                .toArray((err, documents) => {
                    res.send(documents);
                })
            }
            
        })

        
        
    })

    
    console.log('DataBase Connected');
});

app.listen(port, () => {console.log('Server is ready...')})