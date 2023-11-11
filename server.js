const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json())
// Mengatur kors (Cross-Origin Resource Sharing) jika Anda mengirim permintaan dari sisi klien yang berbeda.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/create-checkout-session', async (req, res) =>{
    try{
        console.log("REQ", req.body,)
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode:'payment',
            line_items:req.body.items.map(item=>{
                return{
                    price_data: {
                        currency: 'usd',
                        product_data:{
                            name: item.name,
                            images:[item.imageUrl]
                        },
                        unit_amount_decimal: item.price * 100,
                    },
                    quantity: item.quantity
                }
            }),
            success_url:'http://localhost:3001',
            cancel_url:'http://localhost:3001/cart'
        })
        res.json({url:session.url})
    } catch(e){
        res.status(500).json({error:e.message})
    }
})

// Menangani pembuatan pembayaran
app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
