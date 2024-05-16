const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Import your controllers
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
    issuer: 'https://atilim-759xz.ondigitalocean.app/',
    cert: fs.readFileSync(path.join(__dirname, 'private/university-certificate.crt'), 'utf8'),
    callbackUrl: 'https://atilim-759xz.ondigitalocean.app/saml/acs',
    identifierFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:transient'
  },
  (profile, done) => {
    console.log('SAML Profile:', profile);
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

// Endpoint to intercept SAML response from university ACS endpoint
app.post('/intercept-saml', (req, res, next) => {
  const samlResponse = req.body.SAMLResponse;
  console.log('Intercepted SAML Response:', samlResponse);

  axios.post('https://atilim-759xz.ondigitalocean.app/saml/acs', {
    SAMLResponse: samlResponse,
  }).then(response => {
    console.log('Successfully forwarded SAML response to ACS');
    res.redirect('/');
  }).catch(error => {
    console.error('Error forwarding SAML response to ACS:', error);
    res.status(500).send('Error forwarding SAML response to ACS');
  });
});

// SAML ACS endpoint
app.post('/saml/acs', (req, res, next) => {
  console.log('SAML ACS request received');
  console.log('SAML Request Headers:', req.headers);
  console.log('SAML Request Body:', req.body);

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

      // Extract email and student number
      const email = user.eMail || user.attributes.eMail;
      const studentNumber = user.studentNumber || user.attributes.studentNumber;

      return res.json({ email, studentNumber });
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

// Example route to fetch user data
app.get('/api/user', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('Authenticated User:', req.user); // Log the entire user object for debugging
    const email = req.user.eMail || req.user.attributes.eMail;
    const studentNumber = req.user.studentNumber || req.user.attributes.studentNumber;
    res.json({ email, studentNumber });
  } else {
    res.status(401).send('Unauthorized');
  }
});

// Example protected route
app.get('/api/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send('This is a protected route');
});

// Other routes to fetch exam data
const routes = [
  { path: '/courses', file: 'public/coursesData.json' },
  { path: '/EngMidExams', file: 'public/EngMidExams.json' },
  { path: '/GeneralMidExams', file: 'public/GenCoursesExams.json' },
  { path: '/bussMidExams', file: 'public/BussCoursesExams.json' },
  { path: '/AviMidExams', file: 'public/CavCoursesExams.json' },
  { path: '/artsAndSinMidExams', file: 'public/fefCoursesExams.json' },
  { path: '/fineartsMidExams', file: 'public/gsodCoursesExams.json' },
  { path: '/GeneralFinalExams', file: 'public/FinalExams/GeneralFinalExams.json' },
  { path: '/EngFinalExams', file: 'public/FinalExams/EngFinalExams.json' },
];

routes.forEach(route => {
  app.get(route.path, (req, res) => {
    const filePath = path.join(__dirname, route.file);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.status(500).json({ message: "Error reading data file" });
      } else {
        res.json(JSON.parse(data));
      }
    });
  });
});

// Route to generate schedules
app.post('/generateSchedule', async (req, res) => {
  try {
    const courseIds = req.body.courseIds;

    // Load courses from the JSON file
    const filePath = path.join(__dirname, 'public/coursesData.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const allCourses = JSON.parse(data);

    // Filter courses based on the provided IDs
    const selectedCourses = allCourses.filter(course => courseIds.includes(course.id));

    // Generate all possible schedules without time conflicts
    const schedules = scheduleGenerator.generateAllSchedules(selectedCourses);
    
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: "Error generating schedules: " + error.message });
  }
});

// Schedule fetchDataAndProcess to run every 24 hours
setInterval(fetchDataAndProcess, 24 * 3600 * 1000);
setInterval(fetchMidExams, 24 * 3600 * 1000);
setInterval(fetchGeneralCoursesExams, 24 * 3600 * 1000);
setInterval(fetchBussMidExams, 24 * 3600 * 1000);
setInterval(fetchAviMidExams, 24 * 3600 * 1000);
setInterval(fetchfefMidExams, 24 * 3600 * 1000);
setInterval(fetchgsodMidExams, 24 * 3600 * 1000);
setInterval(fetchGeneralFinalExams, 24 * 3600 * 1000);
setInterval(fetchEngFinalExams, 24 * 3600 * 1000);

// Initial fetch on startup
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
