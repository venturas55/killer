const express = require('express');
require('dotenv').config();

const router = express.Router();
const Stripe = require('stripe');

const passport = require('passport');
const funciones = require('../lib/funciones');

const pool = require("../database");
const stripe = new Stripe(process.env.STRIPE_PRIV || 'PRIVATE KEY');


router.post('/payment/create-checkout-session', async (req, res) => {
    console.log(req.user);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'eur',
                product_data: {
                    name: 'Donatativo por usar Killer',
                },
                unit_amount: 100, // Cantidad en céntimos (1€ = 100 céntimos)
            },
            quantity: 1,
        }],
        mode: 'payment',
        success_url: 'http://localhost:5001/payment/success',
        cancel_url: 'http://localhost:5001/payment/cancel',
    });

    res.json(session);








    //    console.log(req.user);
    /*     const cus = await stripe.customers.create({
            email: req.user.email,
            name: req.user.full_name,
            //usuario: req.user.usuario,
        }) */

});

router.get('/payment/success', async (req, res) => {
    res.render("payment/success");
});

router.get('/payment/cancel', async (req, res) => {
    res.render("payment/cancel");
});

module.exports = router;