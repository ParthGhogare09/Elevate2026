import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Workshop from './models/Workshop.js';
import SystemSettings from './models/SystemSettings.js';
import TimelineMilestone from './models/TimelineMilestone.js';
import Announcement from './models/Announcement.js';

dotenv.config();

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Database connected successfully!');

    // 1. Seed Admin User
    await User.deleteMany({});
    console.log('Deleted old users.');
    
    const admin = new User({
      username: 'admin',
      password: 'elevate2026admin', // Pre-save hook hashes this automatically
      role: 'admin'
    });
    await admin.save();
    console.log('Default Admin Account Seeded: admin / elevate2026admin');

    // 2. Seed Workshops (without speaker details in description, as requested)
    await Workshop.deleteMany({});
    console.log('Deleted old workshops.');

    const workshops = [
      {
        id: 'linkedin-mastery',
        title: 'LinkedIn Mastery',
        description: 'Optimize your LinkedIn profile, learn search engine optimization networking strategies, and build a professional personal brand.',
        mentor: 'Rohan Sharma',
        dateTime: 'July 10, 2026 - 05:00 PM IST',
        status: 'Open',
        meetingLink: 'https://zoom.us/j/mock-linkedin',
        resources: [
          { title: 'LinkedIn Profile Checklist', url: 'https://example.com/linkedin-checklist.pdf', type: 'PDF' }
        ]
      },
      {
        id: 'github-version-control',
        title: 'GitHub & Version Control',
        description: 'Master Git command line basics, branching, merging, pull requests, resolving conflicts, and building a stellar project repository portfolio.',
        mentor: 'Aisha Verma',
        dateTime: 'July 12, 2026 - 05:00 PM IST',
        status: 'Open',
        meetingLink: 'https://zoom.us/j/mock-github',
        resources: [
          { title: 'Git Cheat Sheet', url: 'https://example.com/git-cheatsheet.pdf', type: 'PDF' }
        ]
      },
      {
        id: 'web-development',
        title: 'Web Development (React + Tailwind)',
        description: 'Build modern responsive layouts from scratch using React components, configure styling tokens, and deploy static build pages.',
        mentor: 'Vikram Malhotra',
        dateTime: 'July 15, 2026 - 05:00 PM IST',
        status: 'Open',
        meetingLink: 'https://zoom.us/j/mock-webdev',
        resources: []
      },
      {
        id: 'app-development',
        title: 'App Development (React Native)',
        description: 'Introduction to building native cross-platform mobile apps for iOS and Android, handling state components, and mobile layout files.',
        mentor: 'Sneha Patil',
        dateTime: 'July 18, 2026 - 05:00 PM IST',
        status: 'Open',
        meetingLink: 'https://zoom.us/j/mock-appdev',
        resources: []
      },
      {
        id: 'data-science',
        title: 'Data Science & Machine Learning',
        description: 'Analyze data frames using Python libraries, parse data fields, plot chart graphs, and train regression algorithms.',
        mentor: 'Dr. Amit Sen',
        dateTime: 'July 20, 2026 - 05:00 PM IST',
        status: 'Open',
        meetingLink: 'https://zoom.us/j/mock-datascience',
        resources: []
      },
      {
        id: 'presentation-soft-skills',
        title: 'Presentation & Soft Skills',
        description: 'Overcome public speaking fear, design engaging visual pitch decks, and improve corporate presentation delivery.',
        mentor: 'Priya Iyer',
        dateTime: 'July 22, 2026 - 05:00 PM IST',
        status: 'Open',
        meetingLink: 'https://zoom.us/j/mock-softskills',
        resources: []
      }
    ];

    await Workshop.insertMany(workshops);
    console.log('6 Default Workshops Seeded successfully.');

    // 3. Seed System Settings
    await SystemSettings.deleteMany({});
    console.log('Deleted old settings.');

    const defaultSettings = new SystemSettings({
      eventTitle: 'Elevate 2026',
      eventTagline: 'Upgrade Your Skills, Elevate Your Future',
      eventMode: 'Online Webinar Series',
      upiId: 'sknieee@upi',
      qrCodeFull: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=sknieee@upi&pn=SKN%20IEEE&am=150&cu=INR&tn=Elevate%202026%20Full%20Package',
      qrCodeCustom: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=upi://pay?pa=sknieee@upi&pn=SKN%20IEEE&am=40&cu=INR&tn=Elevate%202026%20Custom%20Workshops',
      priceFull: 150,
      priceCustom: 40
    });
    await defaultSettings.save();
    console.log('Default System Settings Seeded successfully.');

    // 4. Seed Dynamic Timeline Milestones
    await TimelineMilestone.deleteMany({});
    console.log('Deleted old timeline milestones.');

    const defaultMilestones = [
      { title: 'Registration Open', date: 'June 20, 2026', desc: 'Secure your entry early. SKN IEEE SB Members enter free.', active: true, order: 1 },
      { title: 'Payment Verification', date: 'Ongoing', desc: 'Screenshot review and branch enrollment check-in audit.', active: true, order: 2 },
      { title: 'Workshop 1-6', date: 'July 10 - July 22, 2026', desc: 'Interactive live sessions with top tech mentors.', active: true, order: 3 },
      { title: 'Attendance logs', date: 'During Webinars', desc: 'Scan dynamic check-in codes to register presence.', active: true, order: 4 },
      { title: 'Feedback & Review', date: 'July 25, 2026', desc: 'Submit session feedback in student dashboard.', active: true, order: 5 }
    ];
    await TimelineMilestone.insertMany(defaultMilestones);
    console.log('5 Default Timeline Milestones Seeded.');

    // 5. Seed Announcements
    await Announcement.deleteMany({});
    console.log('Deleted old announcements.');

    const defaultAnnouncement = new Announcement({
      title: 'Registrations Open!',
      content: 'Grab the Full Package for all 6 workshops at just ₹150! Free registrations for SKN IEEE student branch members.',
      type: 'popup',
      active: true
    });
    await defaultAnnouncement.save();
    console.log('Default Announcement Seeded.');

    console.log('Database Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error(`Database seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
