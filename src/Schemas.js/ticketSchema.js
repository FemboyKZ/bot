import { model, Schema } from "mongoose";

let ticketSchema = new Schema({
  Guild: String,
  Channel: String,
  Ticket: String,
});

module.exports = model("ticketSchema", ticketSchema);
