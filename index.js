const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const SamlStrategy = require('passport-saml').Strategy;
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const fetchDataAndProcess = require('./controller/dataFetcherController').fetchDataAndProcess;
const scheduleGenerator = require('./controller/scheduleController');
const { fetchMidExams, fetchBussMidExams, fetchAviMidExams, fetchfefMidExams, fetchgsodMidExams } = require('./controller/examsFetchController');
const { fetchGeneralCoursesExams } = require('./controller/examsFetchController');
const { fetchGeneralFinalExams, fetchEngFinalExams } = require('./controller/finalExamsController');

const port = process.env.PORT || 4000;

// Middleware
const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(session({ secret: 's3cr3tK3yTh@t1sV3ryL0ng@ndR@nd0m', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// SAML Strategy
passport.use(new SamlStrategy({
    path: '/saml/acs',
    entryPoint: 'https://kimlik-dev.atilim.edu.tr/saml2/sso',
    issuer: 'https://beta-atacs.atilim.edu.tr/',
    cert: `-----BEGIN CERTIFICATE-----
MIIC9TCCAd2gAwIBAgIUZ70u1pmAaiRxQjE0AzNT2UqS4W4wDQYJKoZIhvcNAQELBQAwIzEhMB8GA1UEAwwYYmV0YS1hdGFjcy5hdGlsaW0uZWR1LnRyMB4XDTI0MDUwOTA4MzEyNVoXDTM0MDUwNzA4MzEyNVowIzEhMB8GA1UEAwwYYmV0YS1hdGFjcy5hdGlsaW0uZWR1LnRyMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoxK0rklf7t1J2Ie5RaI/CSBtH+0iirabfqkdxQWzizlRaTrgTYZC8J8L5VW1ytOP/PREwyOcvsWcnxI5HwdD+EpPDnWb2DNQfH5fGSusQVfNcT958bVw/fJz+jDTNEX6E92ztA42/Nn0XKLRsEfbKl6GNKTBJ7y1tgF+NBSlulapw9HXOSk5p79ZfmaeDv5mXPW/I/E5KBPjlSmVm8Beo6GQbLKubZPZbj36uyGAobCsK659rZu65e21bIY0rCeOsL5414A9pjfbf18WnDtqiQGHDH86ob5cVR0XVJ8pvdeSTC4pKAjsIjOQvld+goHMxJQQkQ25O8aGGJKae3WuxwIDAQABoyEwHzAdBgNVHQ4EFgQU8igbgfMW6MGmsdbRThNl8uNDwV0wDQYJKoZIhvcNAQELBQADggEBACHRSNgIg/2MZpucdWphiKOgVTgy/XmHz5DWM7iP8nZ+SwilxgBKR+6gKoCD+OT3m2hFnr2rEywzDrfIhKcqv3WDmU5a3LrcV18lJcC1G7pzoUorDbKfFGZioDlaQOLMfb71BU6pLfJHOfvRofgReARRJpwlVwstrzALCq0mfzflPHZHEN0v63IH6D/OMSBBY5BxQdXeBFWpAU1AVagQNnZ+Ft9eo0mma6JaVYnWBqpQpcBoDsVq1VQnofPt35wwBKzBl4kIZLqH+yo3/BVtQIL50LaQh65LbBsofjkRPyUMr3+wUCKnQ5fVDx175juPWP1vhqx1pgTRgMYfHGTGTkU=
-----END CERTIFICATE-----`,
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

// Enhanced Error Handling
app.post('/saml/acs', (req, res, next) => {
  passport.authenticate('saml', (err, user, info) => {
    if (err) {
      console.error('SAML Authentication Error:', err);
      return res.redirect('/');
    }
    if (!user) {
      console.error('SAML Authentication Failed:', info);
      return res.redirect('/');
    }
    req.logIn(user, (err) => {
      if (err) {
        console.error('Login Error:', err);
        return res.redirect('/');
      }
      return res.redirect('/');
    });
  })(req, res, next);
});

app.get('/saml/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout Error:', err);
        }
        res.redirect('/');
    });
});

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

setInterval(fetchEngFinalExams, 24 * 3600 * 1000)




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
