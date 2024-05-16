const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const axios = require('axios'); // Using Axios to simulate Postman

// Import your controllers (ensure these are correctly implemented and available)
const fetchDataAndProcess = require('./controller/dataFetcherController').fetchDataAndProcess;
const scheduleGenerator = require('./controller/scheduleController');
const { fetchMidExams, fetchBussMidExams, fetchAviMidExams, fetchfefMidExams, fetchgsodMidExams, fetchGeneralCoursesExams } = require('./controller/examsFetchController');
const { fetchGeneralFinalExams, fetchEngFinalExams } = require('./controller/finalExamsController');

const port = process.env.PORT || 4000;

// Initialize Express app
const app = express();

// Middleware setup
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 's3cr3tK3yTh@t1sV3ryL0ng@ndR@nd0m', resave: false, saveUninitialized: true }));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// SAML Strategy configuration
passport.use(new SamlStrategy({
    path: '/saml/acs',
    entryPoint: 'https://kimlik-dev.atilim.edu.tr/saml2/sso',
    issuer: 'https://beta-atacs.atilim.edu.tr/',
    cert: fs.readFileSync(path.join(__dirname, 'private/university-certificate.crt'), 'utf8'),
    callbackUrl: 'https://atilim-759xz.ondigitalocean.app/saml/acs',
    logoutUrl: 'https://atilim-759xz.ondigitalocean.app/saml/logout',
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:X509SubjectName'
  },
  (profile, done) => {
    console.log('SAML Profile:', profile);  // Logging the profile for debugging
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Route to initiate SAML authentication
app.get('/login', (req, res, next) => {
  passport.authenticate('saml')(req, res, next);
});

// SAML ACS endpoint with enhanced error handling and logging
app.post('/saml/acs', (req, res, next) => {
  console.log('SAML ACS request received');
  console.log('SAML Request Headers:', req.headers);  // Log request headers
  console.log('SAML Request Body:', req.body);  // Log request body
  
  passport.authenticate('saml', (err, user, info) => {
    if (err) {
      console.error('SAML Authentication Error:', err);
      return res.status(500).send('SAML Authentication Error');
    }
    if (!user) {
      console.error('SAML Authentication Failed:', info);
      return res.status(401).send('SAML Authentication Failed');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login Error:', err);
        return res.status(500).send('Login Error');
      }
      console.log('SAML Authentication Successful');
      return res.redirect('/');
    });
  })(req, res, next);
});

// SAML SLO endpoint
app.get('/saml/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout Error:', err);
    }
    res.redirect('/');
  });
});

// Basic route
app.get('/', (req, res) => {
  res.send("Hello World");
});


app.get('/courses', (req, res) => {
    const filePath = path.join(__dirname, 'public/coursesData.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ message: "Error reading data file" });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/EngMidExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/EngMidExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ message: "Error reading exam data file" });
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/GeneralMidExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/GenCoursesExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err){
            res.status(500).json({message: "Error reading exam data file"});
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/bussMidExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/BussCoursesExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err){
            res.status(500).json({message: "Error reading exam data file"});
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/AviMidExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/CavCoursesExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err){
            res.status(500).json({message: "Error reading exam data file"});
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/artsAndSinMidExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/fefCoursesExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err){
            res.status(500).json({message: "Error reading exam data file"});
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/fineartsMidExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/gsodCoursesExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err){
            res.status(500).json({message: "Error reading exam data file"});
        } else {
            res.json(JSON.parse(data));
        }
    });
});


app.get('/GeneralFinalExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/FinalExams/GeneralFinalExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err){
            res.status(500).json({message: "Error reading exam data file"});
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.get('/EngFinalExams', (req, res) => {
    const filePath = path.join(__dirname, 'public/FinalExams/EngFinalExams.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err){
            res.status(500).json({message: "Error reading exam data file"});
        } else {
            res.json(JSON.parse(data));
        }
    });
});


app.post('/generateSchedule', async (req, res) => {
    try {
        const courseIds = req.body.courseIds;

        // Load courses from the JSON file
        const filePath = path.join(__dirname, 'public/coursesData.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const allCourses = JSON.parse(data);

        // Filter courses based on the provided IDs
        const selectedCourses = allCourses.filter(course => courseIds.includes(course.id));

        // Generate all possible schedules without time conflicts using functions from scheduleGenerator module
        const schedules = scheduleGenerator.generateAllSchedules(selectedCourses);
        
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Error generating schedules: " + error.message });
    }
});


// ... (other routes and configurations)


// Schedule fetchDataAndProcess to run every 3 hours
setInterval(fetchDataAndProcess, 24 * 3600 * 1000);

// Schedule fetchMidExams to run every 3 hours
setInterval(fetchMidExams, 24 * 3600 * 1000);

setInterval(fetchGeneralCoursesExams, 24 * 3600 * 1000);

setInterval(fetchBussMidExams, 24 * 3600 * 1000);

setInterval(fetchAviMidExams, 24 * 3600 * 1000);

setInterval(fetchfefMidExams, 24 * 3600 * 1000);

setInterval(fetchgsodMidExams, 24 * 3600 * 1000);

setInterval(fetchGeneralFinalExams, 24 * 3600 * 1000);

setInterval(fetchEngFinalExams, 24 * 3600 * 1000);


// Initial fetch on startup for both functions
fetchDataAndProcess();
fetchMidExams();
fetchGeneralCoursesExams();
fetchBussMidExams();
fetchAviMidExams();
fetchfefMidExams();
fetchgsodMidExams();
fetchGeneralFinalExams();
fetchEngFinalExams();


app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});
