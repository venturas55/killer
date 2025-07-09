import { Router } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_PRIV || 'PRIVATE KEY');

router.get('/payment/landing', async (req, res) => {
    res.render("payment/landing");
});
router.post('/payment/create-checkout-session', async (req, res) => {
    //console.log(req.user);
    var importe = parseFloat(req.body.amount);// Cantidad en céntimos (1€ = 100 céntimos)
    var frecuency = req.body.frequency;
    var taxes = req.body.taxes;

    if (taxes) {
        // Si hay impuestos, calcula el nuevo importe
        importe = Math.round((importe * 1.015 + 0.25) * 100); // Redondea el importe en centavos
    } else {
        importe = Math.round(importe * 100); // Asegúrate de enviar la cantidad en céntimos
    }
    console.log(importe + " " + frecuency + " " + taxes);
    console.log("Completando pago de " + importe);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
            price_data: {
                currency: 'eur',
                product_data: {
                    name: 'Donatativo por usar Killer',
                },
                unit_amount: importe , 
            },
            quantity: 1,
        }],
        mode: 'payment',
        //TODO: estos links tendrían que ser más dinamicos
        success_url: `http://${req.headers.host}/payment/success`,
        cancel_url: `http://${req.headers.host}/payment/cancel`
    });

    res.redirect(session.url);
    //res.json(session.url);
});

router.get('/payment/success', async (req, res) => {
    res.render("payment/success");
});

router.get('/payment/cancel', async (req, res) => {
    res.render("payment/cancel");
});

export default router;