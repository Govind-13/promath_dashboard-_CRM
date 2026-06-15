import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { getInitialColleges, getInitialNotifications } from './src/seedData';
import { College, Notification, BillingDoc } from './src/types';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DB_FILE = path.join(process.cwd(), 'db.json');

// Memory cache state
let database: {
  colleges: College[];
  notifications: Notification[];
  billing: {
    quotations: BillingDoc[];
    invoices: BillingDoc[];
    proposals: any[];
  }
} = {
  colleges: [],
  notifications: [],
  billing: {
    quotations: [],
    invoices: [],
    proposals: []
  }
};

// Ensure database file is initialized
const loadDatabase = () => {
  try {
    if (fs.existsSync(DB_FILE)) {
      const dataStr = fs.readFileSync(DB_FILE, 'utf-8');
      database = JSON.parse(dataStr);
    } else {
      console.log('Seeding initial database...');
      database = {
        colleges: getInitialColleges(),
        notifications: getInitialNotifications(),
        billing: {
          quotations: [],
          invoices: [],
          proposals: []
        }
      };
      saveDatabase();
    }
  } catch (err) {
    console.error('Error loading database, using default values', err);
    database = {
      colleges: getInitialColleges(),
      notifications: getInitialNotifications(),
      billing: {
        quotations: [],
        invoices: [],
        proposals: []
      }
    };
  }
};

const saveDatabase = () => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database to disk', err);
  }
};

loadDatabase();

// --- API ROUTES ---

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Auth login endpoint
app.post('/api/auth/login', (req, res) => {
  const { role } = req.body;
  if (!role) {
    return res.status(400).json({ error: 'Role is required' });
  }
  res.json({ success: true, role });
});

// Retrieve all colleges
app.get('/api/colleges', (req, res) => {
  res.json(database.colleges);
});

// Create college
app.post('/api/colleges', (req, res) => {
  const collegeData = req.body;
  const newId = 'col_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const college: College = {
    id: newId,
    name: collegeData.name || '',
    college_type: collegeData.college_type || '',
    academic_year: collegeData.academic_year || '',
    contact_name: collegeData.contact_name || '',
    contact_designation: collegeData.contact_designation || '',
    phone: collegeData.phone || '',
    email: collegeData.email || '',
    location: collegeData.location || '',
    total_students: collegeData.total_students || '',
    current_status: collegeData.current_status || '',
    additional_comments: collegeData.additional_comments || '',
    created_at: new Date().toISOString(),
    stages: collegeData.stages || {},
    automation_journey_progress: collegeData.automation_journey_progress || {},
    usage_courses: collegeData.usage_courses || [],
    automation_journey: collegeData.automation_journey
  };
  
  database.colleges.unshift(college);
  saveDatabase();
  res.json(college);
});

// Update college
app.put('/api/colleges/:id', (req, res) => {
  const { id } = req.params;
  const index = database.colleges.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'College not found' });
  }
  
  database.colleges[index] = {
    ...database.colleges[index],
    ...req.body,
    id // preserve search ID
  };
  
  saveDatabase();
  res.json(database.colleges[index]);
});

// Delete college
app.delete('/api/colleges/:id', (req, res) => {
  const { id } = req.params;
  const index = database.colleges.findIndex(c => c.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'College not found' });
  }
  database.colleges.splice(index, 1);
  saveDatabase();
  res.json({ success: true });
});

// Retrieve billing docs
app.get('/api/billing', (req, res) => {
  res.json(database.billing);
});

// Save billing docs (bulk or updates)
app.post('/api/billing', (req, res) => {
  database.billing = {
    quotations: req.body.quotations || database.billing.quotations || [],
    invoices: req.body.invoices || database.billing.invoices || [],
    proposals: req.body.proposals || database.billing.proposals || []
  };
  saveDatabase();
  res.json(database.billing);
});

// Retrieve notifications
app.get('/api/notifications', (req, res) => {
  res.json(database.notifications);
});

// Mark notification as read
app.put('/api/notifications/:id/read', (req, res) => {
  const { id } = req.params;
  database.notifications = database.notifications.map(n => n.id === id ? { ...n, read: true } : n);
  saveDatabase();
  res.json(database.notifications);
});

// Create new notification
app.post('/api/notifications', (req, res) => {
  const notif = req.body;
  const newNotif: Notification = {
    id: 'n_' + Date.now() + '_' + Math.random().toString(36).substring(2, 5),
    role: notif.role || 'admin',
    message: notif.message || '',
    timestamp: new Date().toISOString(),
    read: false
  };
  database.notifications.unshift(newNotif);
  saveDatabase();
  res.json(newNotif);
});


// --- VITE MIDDLEWARE AND SERVICE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Promath API] Server booted successfully on http://localhost:${PORT}`);
  });
}

startServer();
