import express from "express";
import cors from 'cors';
import mongoose from 'mongoose';
import internshipRoute from './routes/internshipRoute.js';
import userRoute from './routes/userRoute.js';

const app = express();
app.use(express.json());

app.use(cors());

app.get('/', (request, response) => {
    console.log(request);
    return response.status(234).send('Welcome to the Main Page');
});

app.use('/internship', internshipRoute);
app.use('/users', userRoute);

mongoose
    .connect(process.env.URI)
    .then(() => {
        console.log('App connected to database.');
        app.listen(process.env.PORT || 5555, () => {
            console.log(`App is listening to Port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });