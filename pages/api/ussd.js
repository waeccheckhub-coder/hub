import db from '../../lib/db';
import axios from 'axios';

// NOTE: This assumes a standard USSD flow. Adjust parsing based on exact GiantSMS payload.
export default async function handler(req, res) {
  const { msisdn, msgType, text } = req.body; // Adjust based on GiantSMS webhook structure

  let responseMessage = "";
  let action = "con"; // 'con' for continue, 'end' for end

  // Basic State Machine
  if (msgType === "0" || text === "") {
    // Initial Menu
    responseMessage = "Welcome to WAEC gh checkers:\n1. Buy WASSCE\n2. Buy BECE\n3. Buy Placement";
  } else if (text === "1") {
    responseMessage = "WASSCE Checker (GHS 30)\nEnter Quantity (1-50):";
  } else if (text === "2") {
    responseMessage = "BECE Checker (GHS 30)\nEnter Quantity (1-50):";
  } else if (["1", "2"].includes(text.split('*')[0])) {
    // Handling purchase flow via Mobile Money Prompt would go here.
    // Since USSD cannot input card details, you normally trigger a Mobile Money Prompt (USSD Push)
    // using Paystack or Hubtel here, then end the session.
    
    responseMessage = "Please authorize the prompt on your phone to complete purchase.";
    action = "end";
    
    // Trigger Server-side Payment Prompt logic here...
  } else {
    responseMessage = "Invalid option.";
    action = "end";
  }

  res.status(200).json({
    message: responseMessage,
    action: action
  });
}
