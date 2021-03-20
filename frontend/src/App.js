import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import axios from 'axios'

function loadScript(src) {
	return new Promise((resolve) => {
		const script = document.createElement('script')
		script.src = src
		script.onload = () => {
			resolve(true)
		}
		script.onerror = () => {
			resolve(false)
		}
		document.body.appendChild(script)
	})
}

const __DEV__ = document.domain === 'localhost'

function App() {
	const [name, setName] = useState('Mehul')

	async function displayRazorpay() {
		const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

		if (!res) {
			alert('Razorpay SDK failed to load. Are you online?')
			return
		}

		const data = await fetch('http://localhost:1337/razorpay', { method: 'POST' }).then((t) =>
			t.json()
		)

		console.log(data)

		const options = {
			key: __DEV__ ? 'rzp_test_fOH24On88mGG2j' : 'PRODUCTION_KEY',
			currency: data.currency,
			amount: data.amount.toString(),
			order_id: data.id,
			name: 'Donation',
			description: 'Thank you for nothing. Please give us some money',
			image: 'http://localhost:1337/logo.svg',
			handler: function (response) {
				
				alert(response.razorpay_payment_id)
				alert(response.razorpay_order_id)
				alert(response.razorpay_signature)
			},
			prefill: {
				name,
				email: 'sdfdsjfh2@ndsfdf.com',
				phone_number: '9899999999'
			}
		}
		const paymentObject = new window.Razorpay(options)
		paymentObject.open()
	}
	async function displayRazorpaySubscription() {
		const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js')

		if (!res) {
			alert('Razorpay SDK failed to load. Are you online?')
			return
		}

		const data = await fetch('http://localhost:1337/subscription', { method: 'POST' }).then((t) =>
			t.json()
		)

		console.log(data)

		var options = {
			key: "rzp_test_fOH24On88mGG2j",
			subscription_id: data.id,
			name: "Ping",
			description: "Subscription for montly plan",
			image: "/your_logo.png",
			handler: function(response) {
				console.log(response)
				// alert(response.razorpay_payment_id)
				// alert(response.razorpay_subscription_id)
				// alert(response.razorpay_signature);
				
				axios.post(`http://localhost:1337/handler/verification/${data.id}`, response).then(result => {
					console.log(result.data)
				}).catch(error => {
					console.log(error)
				})
				

			},
			prefill: {
			  name: "Abhishek",
			  email: "gaurav.kumar@example.com",
			  contact: "+918830073205"
			},
			notes: {
			  notes_key_1: "Tea, Earl Grey, Hot",
    			notes_key_2: "Tea, Earl Grey… decaf."
			},
			theme: {
			  color: "#F37254"
			}
		}

		
		const paymentObject = new window.Razorpay(options)
		paymentObject.open()
	}

	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>
					Edit <code>src/App.js</code> and save to reload.
				</p>
				<a
					className="App-link"
					onClick={displayRazorpay}
					target="_blank"
					rel="noopener noreferrer"
				>
					Donate $5
				</a>

				<br />
				<br />

				<button onClick={()=> console.log("pressed")}>Create Plans</button>
				<br />
				<button onClick={displayRazorpaySubscription}>Subscription</button>
			</header>
		</div>
	)
}

export default App
