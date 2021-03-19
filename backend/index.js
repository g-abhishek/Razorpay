const app = require('express')()
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id: 'rzp_test_fOH24On88mGG2j',
	key_secret: 'jvfLt7K2E48mHYpRp3gp3Q7V'
})

app.get('/logo.svg', (req, res) => {
	res.sendFile(path.join(__dirname, 'logo.svg'))
})

app.post('/verification', (req, res) => {
	// do a validation
	const secret = '123456789'

	console.log("callback: ", req.body)
	console.log("callback: ", req.body.payload)
	console.log("callback: ", req.headers)

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')
	console.log(digest, req.headers['x-razorpay-signature'])
	
	console.log(Razorpay.validateWebhookSignature(JSON.stringify(req.body), req.headers['x-razorpay-signature'], secret));
	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		if(req.body.event === 'subscription.authenticated'){
			console.log('subscription.authenticated')
		}
		else if(req.body.event === 'subscription.activated'){
			console.log('subscription.activated')
		}
		else if(req.body.event === 'subscription.charged'){
			console.log('subscription.charged')
		}
		else if(req.body.event === 'subscription.cancelled'){
			console.log('subscription.cancelled')
		}
		// process it
	} else {
		// pass it
		console.log('request is not legit')
	}
	res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
	const payment_capture = 1
	const amount = 499
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})


app.post('/subscription', async (req, res) => {
	
	const options = {
		"plan_id":"plan_GoNceGkZeOVWom",
		"total_count":12, //how many times customer will be charged
		"quantity": 1, //how many license
		"customer_notify":1,
		"start_at":1619827200,	// start date
		"expire_by":1622505600, // send date
		"addons":[
			{
			  "item":{
				"name":"Upfront Charges",
				"amount":100,
				"currency":"INR"
			  }
			}
		  ],
		// "offer_id":"offer_JHD834hjbxzhd38d",
		"notes":{
		  "notes_key_1":"Tea, Earl Grey, Hot",
		  "notes_key_2":"Tea, Earl Grey… decaf."
		}
	  }

	try {
		const response = await razorpay.subscriptions.create(options)
		console.log("subscriptions created: ",response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})

app.listen(1337, () => {
	console.log('Listening on 1337')
})
