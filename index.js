const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const csv = require("csv-parser");
const fs = require("fs");
const mongoose = require("mongoose");

// Set up Mongoose connection
mongoose.connect("mongodb://localhost:27017/mydatabase", {
  useNewUrlParser: true,
  //useUnifiedTopology: true,
});
// Schema for all the data
const DataSchema = new mongoose.Schema({
  agent: {
    type: String,
  },
  userType: {
    type: String,
  },
  policy_mode: {
    type: String,
  },
  producer: {
    type: String,
  },
  policy_number: {
    type: String,
  },
  premium_amount_written: String,
  premium_amount: {
    type: Number,
  },
  policy_type: {
    type: String,
  },
  company_name: {
    type: String,
  },
  category_name: {
    type: String,
  },
  policy_start_date: {
    type: Date,
  },
  policy_end_date: {
    type: Date,
  },
  csr: {
    type: String,
  },
  account_name: {
    type: String,
  },
  email: {
    type: String,
  },
  gender: String,
  firstname: {
    type: String,
  },
  city: {
    type: String,
  },
  account_type: {
    type: String,
  },
  phone: {
    type: String,
  },
  address: {
    type: String,
  },
  state: {
    type: String,
  },
  zip: {
    type: String,
  },
  dob: {
    type: Date,
  },
  primary: String,
  Applicant_ID: String,
  agency_id: String,
  haveactive_client_policy: String,
});

const UserSchema = new mongoose.Schema({
  userType: { type: String },
  firstname: { type: String},
  email: { type: String},
  accountNumber: { type: String},
  account_name: { type: String },
  gender: { type: String },
  city: { type: String },
  account_type: { type: String },
  phone: { type: String },
  address: { type: String },
  state: { type: String },
  zip: { type: String },
  dob: { type: String },
});

const AccountSchema = new mongoose.Schema({
  accountNumber: { type: String},
  account_name: { type: String },
  account_type: { type: String },
  producer: { type: String },
  premium_amount_written: { type: String },
  policy_number: { type: String },
  company_name: { type: String },
  category_name: { type: String },
});

const PolicySchema = new mongoose.Schema({
  policy_number: { type: String},
  policy_start_date: { type: Date},
  policy_end_date: { type: Date},
  agent: { type: String },
  policy_mode: { type: String },
  producer: { type: String },
  premium_amount_written: { type: String },
  policy_number: { type: String },
  premium_amount: { type: String },
  policy_type: { type: String },
  company_name: { type: String },
  category_name: { type: String },
});

// Create models for each collection
const Data = mongoose.model("Data", DataSchema);
const User = mongoose.model("User", UserSchema);
const Account = mongoose.model("Account", AccountSchema);
const Policy = mongoose.model("Policy", PolicySchema);

// Set up Multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}`);
  },
});

const upload = multer({ storage });

const app = express();

app.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send("No file uploaded");
  }

  let data = [];

  const parseCsv = () => {
    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on("data", (row) => {
          data.push(row);
        })
        .on("end", () => {
          resolve();
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  };

  const dataCsv = await parseCsv()
    .then(() => {
      return data;
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error parsing CSV");
    });
  console.log(dataCsv);
  res.send(dataCsv);
  // Save the data to the appropriate collections

  dataCsv.forEach((row) => {
    // storing all the data
    const data = new Data({
      agent: row.agent,
      userType: row.userType,
      policy_mode: row.policy_mode,
      producer: row.producer,
      policy_number: row.policy_number,
      premium_amount_written: row.premium_amount_written,
      premium_amount: row.premium_amount,
      policy_type: row.policy_type,
      company_name: row.company_name,
      category_name: row.category_name,
      policy_start_date: row.policy_start_date,
      policy_end_date: row.policy_end_date,
      csr: row.csr,
      account_name: row.account_name,
      email: row.email,
      gender: row.gender,
      firstname: row.firstname,
      city: row.city,
      account_type: row.account_type,
      phone: row.phone,
      address: row.address,
      state: row.state,
      zip: row.zip,
      dob: row.dob,
      primary: row.primary,
      agency_id: row.agency_id,
    });
    data.save();
    // Create a new user
    const user = new User({
      userType: row.userType,
      firstname: row.firstname,
      email: row.email,
      accountNumber: row.accountNumber,
      account_name: row.account_name,
      gender: row.gender,
      city: row.city,
      account_type: row.account_type,
      phone: row.phone,
      address: row.address,
      state: row.state,
      zip: row.zip,
      dob: row.dob,
    });
    user.save();

    // Create a new account
    const account = new Account({
      accountNumber: row.accountNumber,
      account_name: row.account_name,
      account_type: row.account_type,
      producer: row.producer,
      premium_amount_written: row.premium_amount,
      policy_number: row.policy_number,
      company_name: row.company_name,
      category_name: row.category_name,
    });
    account.save();

    // Create a new policy
    const policy = new Policy({
      policy_number: row.policy_number,
      policy_start_date: row.policy_start_date,
      policy_end_date: row.policy_end_date,
      agent: row.agent,
      policy_mode: row.policy_mode,
      producer: row.producer,
      premium_amount_written: row.premium_amount_written,
      policy_number: row.policy_number,
      premium_amount: row.premium_amount,
      policy_type: row.policy_type,
      company_name: row.company_name,
      category_name: row.category_name,
    });
    policy.save();
  });
});

// CRUD operation for user

// Create a new user
app.post('/users', async (req, res) => {
  try {
    const user = new User(req.body);
    //console.log(user)
    await user.save();
    res.status(200).json({success:"user added successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read all users
app.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read a user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.send(user);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a user by ID
app.patch('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).json({success:"user updated successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a user by ID
app.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).json({success:"user deleted successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Create Account
app.post('/accounts', async (req, res) => {
  try {
    const account = new Account(req.body);
    await account.save();
    res.status.json({success:"added account successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read all Accounts
app.get('/accounts', async (req, res) => {
  try {
    const accounts = await Account.find();
    res.send(accounts);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read a account by ID
app.get('/accounts/:id', async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) {
      return res.status(404).send();
    }
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a account by ID
app.patch('/account/:id', async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!account) {
      return res.status(404).send();
    }
    res.status(200).json({success:"account updated successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a account by ID
app.delete('/account/:id', async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) {
      return res.status(404).send();
    }
    res.status.json({success:"account deleted successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

//create Policy
app.post('/policy', async (req, res) => {
  try {
    const account = new Policy(req.body);
    await account.save();
    res.status(200).json({success:"policy created successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read all policies
app.get('/policies', async (req, res) => {
  try {
    const account = await Policy.find();
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Read a policy by ID
app.get('/policy/:id', async (req, res) => {
  try {
    const account = await Policy.findById(req.params.id);
    if (!account) {
      return res.status(404).send();
    }
    res.send(account);
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update a policy by ID
app.patch('/policy/:id', async (req, res) => {
  try {
    const user = await Policy.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).json({success: "policy updated successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});

// Delete a policy by ID
app.delete('/policy/:id', async (req, res) => {
  try {
    const user = await Policy.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).send();
    }
    res.status(200).json({success:"deleted policy successfully"});
  } catch (error) {
    res.status(500).send(error);
  }
});


// Start the server
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
