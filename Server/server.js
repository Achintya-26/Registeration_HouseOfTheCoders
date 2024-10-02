const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Razorpay = require('razorpay');
const dotenv = require('dotenv');
const crypto = require('crypto');


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

const paymentSchema = new mongoose.Schema({
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number,
    currency: String,
    status: {
        type: String,
        default: "created" // other statuses can be 'paid', 'failed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }
});

const Payment = mongoose.model('Payment', paymentSchema);

// Team Schema
const teamSchema = new mongoose.Schema({
    teamName: String,
    teamLeadName: String,
    teamLeadRegisterNo: String,
    teamLeadPhone: String,
    teamLeadEmail: String,
    isVerifiedPayment:{
      type:Boolean,
      default:false
    },
    teamMembers: [
        {
            name: String,
            registrationNumber: String,
            email: String,
            phone: String
        }
    ]
});

const Team = mongoose.model('Team', teamSchema);

// User Schema for members
const userSchema = new mongoose.Schema({
    membershipId: String,
    phoneNumber: String,
});

const User = mongoose.model('User', userSchema);

// Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Registration Route
app.post('/api/team/register', async (req, res) => {
    const { teamName, teamLeadName, teamLeadRegisterNo, teamLeadPhone, teamLeadEmail, teamMembers } = req.body;

    try {
        const team = new Team({
            teamName,
            teamLeadName,
            teamLeadRegisterNo,
            teamLeadPhone,
            teamLeadEmail,
            teamMembers
        });
        
        const savedTeam = await team.save();
        res.status(201).json({ message: 'Team registered successfully', teamId: savedTeam._id });
    } catch (error) {
        console.error('Error registering team:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.put('/api/user/verify-payment/:userId', async(req,res)=>{
  try
  {
  console.log("Hello");
  const Id=req.params.userId;
  const user=await Team.findByIdAndUpdate(Id,{isVerifiedPayment:true},{new:true});
  console.log(user);
  res.status(200).json({success:true})}
  catch(e){
    res.status(500).json({success:false})
    console.log(e);
  }
})

// Login Route
app.post('/api/login', async (req, res) => {
    const { csiId, phone } = req.body;

    try {
        const user = await User.findOne({ membershipId:csiId, phoneNumber:phone });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ isMember: true, data:user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/api/user/delete/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    // const objectId = new mongoose.Types.ObjectId(userId);
    
    // Delete the user directly using deleteOne() with a filter

    const result = await Team.deleteOne({ _id: userId});
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User Deleted!");
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Razorpay Payment Route
// Razorpay Payment Route
app.post('/api/payment', async (req, res) => {
    const { amount, currency, userType, teamId } = req.body;

    const paymentAmount = userType === 'member' ? 300 : 400; // Pricing based on membership

    try {
        const options = {
            amount: paymentAmount * 100, // Amount in paise
            currency: currency,
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Store the payment details in MongoDB
        const payment = new Payment({
            orderId: order.id,
            amount: paymentAmount,
            currency: currency,
            teamId: teamId
        });

        await payment.save();

        res.json({
            orderId: order.id,
            amount: paymentAmount,
            currency: currency
        });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Payment verification route
app.post('/api/payment/verify', async (req, res) => {
    const { orderId, paymentId, signature, teamId } = req.body;

    try {
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(orderId + "|" + paymentId);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === signature) {
            // Update the payment as successful
            await Payment.findOneAndUpdate({ orderId: orderId }, {
                paymentId: paymentId,
                signature: signature,
                status: 'paid'
            });

            // Mark the team as having verified payment
            await Team.findByIdAndUpdate(teamId, { isVerifiedPayment: true }, { new: true });

            res.json({ success: true, message: "Payment verified and team updated." });
        } else {
            res.status(400).json({ success: false, message: "Invalid signature" });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Server listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
