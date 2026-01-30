// Sample data generator for HealthPoint
// Run this script to populate Firestore with sample Indian patient data

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Add your Firebase config here
const firebaseConfig = {
  apiKey: "your_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const indianNames = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
  "Anita Desai", "Rahul Verma", "Kavita Nair", "Suresh Iyer", "Deepa Menon",
  "Arjun Gupta", "Meera Joshi", "Sanjay Rao", "Pooja Agarwal", "Karan Malhotra",
  "Divya Pillai", "Ravi Krishnan", "Lakshmi Bhat", "Nitin Kapoor", "Swati Mehta"
];

const services = [
  { id: 'general', name: 'General Consultation' },
  { id: 'pediatrics', name: 'Pediatrics' },
  { id: 'ent', name: 'ENT Specialists' },
  { id: 'orthopedics', name: 'Orthopedics' },
  { id: 'cardiology', name: 'Cardiology' },
  { id: 'lab', name: 'Blood Lab & Tests' }
];

async function generateSampleData() {
  console.log('Generating sample tokens...');
  
  // Generate 20 sample tokens
  for (let i = 0; i < 20; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const isPriority = Math.random() > 0.7;
    const status = Math.random() > 0.6 ? 'waiting' : (Math.random() > 0.5 ? 'called' : 'completed');
    
    const tokenData = {
      number: `${service.id.toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      serviceName: service.name,
      serviceId: service.id,
      position: Math.floor(Math.random() * 10) + 1,
      expectedTime: Math.floor(Math.random() * 45) + 10,
      isPriority,
      status,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(db, 'tokens'), tokenData);
    console.log(`Created token: ${tokenData.number}`);
  }
  
  console.log('\nGenerating sample appointments...');
  
  // Generate 15 sample appointments
  for (let i = 0; i < 15; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    const name = indianNames[Math.floor(Math.random() * indianNames.length)];
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 7));
    
    const slots = ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"];
    const slot = slots[Math.floor(Math.random() * slots.length)];
    
    const appointmentData = {
      serviceId: service.id,
      serviceName: service.name,
      date: date.toISOString().split('T')[0],
      slot,
      name,
      phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
      status: 'confirmed',
      createdAt: serverTimestamp(),
    };
    
    await addDoc(collection(db, 'appointments'), appointmentData);
    console.log(`Created appointment for: ${name}`);
  }
  
  console.log('\n✅ Sample data generation complete!');
}

generateSampleData().catch(console.error);
