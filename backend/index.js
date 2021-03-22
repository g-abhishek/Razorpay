const app = require('express')()
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const cors = require('cors')
const bodyParser = require('body-parser')
const crypto = require('crypto')

app.use(cors())
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id: 'rzp_test_fOH24On88mGG2j',
	key_secret: 'jvfLt7K2E48mHYpRp3gp3Q7V'
})
const secret = '123456789'

app.get('/logo.svg', (req, res) => {
	res.sendFile(path.join(__dirname, 'logo.svg'))
})

app.post('/verification', (req, res) => {	
	// do a validation	

	console.log("callback: ", req.body)
	console.log("callback: ", req.body.payload)

	if(req.body.event === 'subscription.activated'){
		// Sent when the subscription moves to the "active" state either from the "authenticated", "pending" or "halted" state
		console.log('subscription.activated')
	}
	else if(req.body.event === 'subscription.charged'){
		// Sent every time a successful charge is made on the subscription.
		console.log('subscription.charged')
	}
	else if(req.body.event === 'subscription.completed'){
		// Sent when all the invoices are generated for a subscription and the subscription moves to the completed state.
		console.log('subscription.completed')
	}
	else if(req.body.event === 'subscription.updated'){
		// Sent when a subscription is successfully updated. There is no state change when a subscription is updated.
		console.log('subscription.updated')
	}
	else if(req.body.event === 'subscription.pending'){
		// This happens when a charge on the card fails
		// This happens when a charge on the card fails. We try to charge the card on a periodic basis while it is in the pending state. 
		// If the payment fails again, the webhook is triggered again.
		console.log('subscription.pending')
	}
	else if(req.body.event === 'subscription.halted'){
		// Sent when all retries have been exhausted and the subscription moves from the pending state to the halted state.
		console.log('subscription.halted')
	}
	else if(req.body.event === 'subscription.cancelled'){
		// Sent when a subscription is cancelled and the subscription moves to the cancelled state.
		console.log('subscription.cancelled')
	}
	else if(req.body.event === 'subscription.paused'){
		// Sent when a subscription is paused and the subscription moves to the paused state.
		console.log('subscription.paused')
	}
	else if(req.body.event === 'subscription.resumed'){
		// Sent when a subscription is unpaused and the subscription moves to the resumed state.
		console.log('subscription.resumed')
	}
	else{
		// for normal order payments

		const digest = crypto.createHmac('sha256', secret).update(JSON.stringify(req.body)).digest('hex')
		console.log(digest, req.headers['x-razorpay-signature'])
		
		// console.log(Razorpay.validateWebhookSignature(JSON.stringify(req.body), req.headers['x-razorpay-signature'], secret));
		if (digest === req.headers['x-razorpay-signature']) {
			console.log('request is legit')		
			// process it
		} else {
			// pass it
			console.log('request is not legit')
		}

	}

	
	res.json({ status: 'ok' })
})

app.post("/handler/verification/:sid", async (req, res) => {

	// sub_GooHluZgVezeDE

	console.log("handler callback: ", req.body)
	const digest = crypto.createHmac('sha256', razorpay.key_secret).update(req.body.razorpay_payment_id + '|' + req.params.sid).digest('hex');
	if(digest === req.body.razorpay_signature){
		console.log('handler callback request is legit')
		try {
			const response = await razorpay.subscriptions.fetch(req.params.sid)
			console.log("Fetch Result: ",response)
			return res.send({
				statusCode: 200,
				message: "Request is legit"
			})
		} catch (error) {	// if id is wrong, if id does not exist
			console.log(error)
			return res.send({
				statusCode: 400,
				message: error
			})
		}
		
	}else{
		console.log('handler callback request is not legit')
		return res.send({
			statusCode: 401,
			message: "Request is not legit"
		})
	}
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
		"expire_by":1622505600, // end date
		
		// "offer_id":"offer_JHD834hjbxzhd38d",
		"notes":{
		  "notes_key_1":"Tea, Earl Grey, Hot",
		  "notes_key_2":"Tea, Earl Grey… decaf."
		}
	  }

	try {
		const response = await razorpay.subscriptions.create(options)

		// subscription created store the response to user collection or other collection

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
