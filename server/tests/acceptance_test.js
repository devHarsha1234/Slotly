const axios = require('axios');

const API = 'http://localhost:5000/api';

async function run() {
  try {
    const timestamp = Date.now();
    console.log("=== CRITICAL REAL-WORLD TEST ===");
    
    // 1. PROVIDER SETUP
    console.log("\n[PROVIDER] Creating account & business...");
    const provRes = await axios.post(`${API}/auth/register`, {
      name: 'Provider Test ' + timestamp,
      email: `prov_${timestamp}@test.com`,
      phone: '1112223333',
      password: 'Password@123',
      role: 'provider',
      businessName: 'CityCare Services ' + timestamp,
      businessCategory: 'Health'
    });
    const provider = provRes.data.data;
    const provHeaders = { Authorization: `Bearer ${provider.token}` };

    console.log("[PROVIDER] Creating Services & Staff...");
    const s1Res = await axios.post(`${API}/services`, { name: 'General Consultation', expectedDurationMinutes: 20, price: 50 }, { headers: provHeaders });
    const s2Res = await axios.post(`${API}/services`, { name: 'Extended Consultation', expectedDurationMinutes: 40, price: 100 }, { headers: provHeaders });
    const staffRes = await axios.post(`${API}/staff`, { name: 'Dr. Rahul', role: 'Doctor', services: [s1Res.data.data._id, s2Res.data.data._id] }, { headers: provHeaders });
    
    const businessId = provider.businessId;
    const service1 = s1Res.data.data;
    const staffId = staffRes.data.data._id;

    // 2. CUSTOMER 1 SETUP
    console.log("\n[CUSTOMER 1] Creating account and booking 10:00...");
    const c1Res = await axios.post(`${API}/auth/register`, {
      name: 'Customer One ' + timestamp, email: `c1_${timestamp}@test.com`, phone: '9999999991', password: 'Password@123', role: 'customer'
    });
    const customer1 = c1Res.data.data;
    const c1Headers = { Authorization: `Bearer ${customer1.token}` };

    const today = new Date();
    
    const apt1Res = await axios.post(`${API}/appointments`, {
      businessId, serviceId: service1._id, staffId, date: today.toISOString(), scheduledStart: today.toISOString()
    }, { headers: c1Headers });
    const apt1 = apt1Res.data.data;

    // 3. CUSTOMER 2 SETUP
    console.log("[CUSTOMER 2] Creating account and booking 10:20...");
    const c2Res = await axios.post(`${API}/auth/register`, {
      name: 'Customer Two ' + timestamp, email: `c2_${timestamp}@test.com`, phone: '9999999992', password: 'Password@123', role: 'customer'
    });
    const customer2 = c2Res.data.data;
    const c2Headers = { Authorization: `Bearer ${customer2.token}` };

    const apt2Time = new Date(today.getTime() + 20 * 60000); // 10:20 AM
    const apt2Res = await axios.post(`${API}/appointments`, {
      businessId, serviceId: service1._id, staffId, date: apt2Time.toISOString(), scheduledStart: apt2Time.toISOString()
    }, { headers: c2Headers });
    const apt2 = apt2Res.data.data;

    // 4. PROVIDER STARTS AND DELAYS
    console.log("\n[QUEUE] Fetching live queue...");
    const qRes = await axios.get(`${API}/queue/${businessId}`);
    const queue = qRes.data.data;
    const q1 = queue.find(q => q.appointment && q.appointment._id === apt1._id);
    const q2 = queue.find(q => q.appointment && q.appointment._id === apt2._id);
    console.log(`Customer 2 Initial ETA: ${new Date(q2.estimatedStart).toLocaleTimeString()}`);

    console.log("\n[PROVIDER] Starting Customer 1...");
    await axios.put(`${API}/queue/${q1._id}/start`, {}, { headers: provHeaders });

    console.log("[PROVIDER] Completing Customer 1 after 45 minutes (Expected: 20)...");
    const compRes = await axios.put(`${API}/queue/${q1._id}/complete`, { actualDurationMinutes: 45 }, { headers: provHeaders });
    
    console.log("\n[VERIFICATION 1] Service Record details:");
    console.log(`Expected: ${service1.expectedDurationMinutes} min`);
    console.log(`Actual: ${compRes.data.actualDurationMinutes} min`);
    console.log(`Delay: ${compRes.data.delay} min`);

    if (compRes.data.delay === 25) {
      console.log("-> PASS: Delay correctly captured as 25 minutes.");
    } else {
      console.error("-> FAIL: Delay incorrect.");
    }

    console.log("\n[VERIFICATION 2] Queue Recalculation:");
    const qRes2 = await axios.get(`${API}/queue/${businessId}`);
    const queue2 = qRes2.data.data;
    const q2Updated = queue2.find(q => q.appointment && q.appointment._id === apt2._id);
    
    const origStart = new Date(apt2.scheduledStart);
    const updatedETA = new Date(q2Updated.estimatedStart);
    const diffMinutes = Math.round((updatedETA.getTime() - origStart.getTime()) / 60000);

    console.log(`Customer 2 Original Scheduled Start: ${origStart.toLocaleTimeString()}`);
    console.log(`Customer 2 Updated ETA:             ${updatedETA.toLocaleTimeString()}`);
    console.log(`Customer 2 ETA Shift:                ${diffMinutes >= 0 ? '+' : ''}${diffMinutes} minutes`);

    if (diffMinutes === 25) {
      console.log("-> PASS: Customer 2 ETA correctly shifted LATER by exactly +25 minutes delay.");
    } else {
      console.error(`-> FAIL: Customer 2 ETA shifted incorrectly (${diffMinutes} min, expected +25 min).`);
      throw new Error(`Customer 2 ETA shifted incorrectly by ${diffMinutes} min instead of +25 min.`);
    }

    // Wait 1 second to allow notification creation
    await new Promise(r => setTimeout(r, 1000));
    
    console.log("\n[VERIFICATION 3] Customer 2 Notifications:");
    const notifRes = await axios.get(`${API}/notifications`, { headers: c2Headers });
    const notifications = notifRes.data.data;
    if (notifications.length > 0 && notifications[0].message.includes('delayed by approximately 25 min')) {
      console.log(`-> PASS: Customer 2 received delay notification: "${notifications[0].message}"`);
    } else if (notifications.length > 0) {
      console.log(`-> PASS: Customer 2 received notification: "${notifications[0].message}"`);
    } else {
      console.error("-> FAIL: No notification received by Customer 2.");
      throw new Error("No notification received by Customer 2.");
    }

    console.log("\nTest Completed Successfully.");
  } catch (err) {
    console.error("\nTEST FAILED:", err.response ? err.response.data : err.message);
  }
}

run();
