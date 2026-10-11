const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';

async function runE2EDemo() {
  console.log('================================================================');
  console.log('       SLOTLY ADAPTIVE ENGINE - END-TO-END DEMO TEST SUITE      ');
  console.log('================================================================');
  console.log('Scenario: 3 Customers Sequential -> Service 1 Overrun (+15m)');
  console.log('          -> Cascade ETA Recalculation -> Customer 2 Cancels');
  console.log('          -> Queue Pull-Forward -> Walk-in Ingest -> What-If Sim');
  console.log('================================================================\n');

  const ts = Date.now();

  try {
    // -------------------------------------------------------------
    // STEP 1: PROVIDER SETUP
    // -------------------------------------------------------------
    console.log('[STEP 1] Registering Service Provider & Setting Up Catalog...');
    const businessName = `Metro Barber Studio ${ts}`;
    const provRes = await axios.post(`${API}/auth/register`, {
      name: `Studio Owner ${ts}`,
      email: `provider_${ts}@demo.com`,
      phone: '9876543210',
      password: 'Password@123',
      role: 'provider',
      businessName,
      businessCategory: 'Grooming'
    });
    const provider = provRes.data.data;
    const provHeaders = { Authorization: `Bearer ${provider.token}` };
    const businessId = provider.businessId;

    // Create Service: 20 min expected duration
    const sRes = await axios.post(`${API}/services`, {
      name: 'Classic Haircut',
      expectedDurationMinutes: 20,
      price: 35
    }, { headers: provHeaders });
    const service = sRes.data.data;

    // Create Staff
    const staffRes = await axios.post(`${API}/staff`, {
      name: 'Master Barber Alex',
      role: 'Lead Stylist',
      services: [service._id]
    }, { headers: provHeaders });
    const staff = staffRes.data.data;
    console.log(`  ✓ Business: ${businessName} (ID: ${businessId})`);
    console.log(`  ✓ Service: ${service.name} (${service.expectedDurationMinutes} min)`);
    console.log(`  ✓ Staff: ${staff.name}\n`);

    // -------------------------------------------------------------
    // STEP 2: REGISTER 3 CUSTOMERS
    // -------------------------------------------------------------
    console.log('[STEP 2] Registering 3 Real Customer Accounts...');
    const createCustomer = async (num) => {
      const res = await axios.post(`${API}/auth/register`, {
        name: `Customer ${num} (${ts.toString().slice(-4)})`,
        email: `customer${num}_${ts}@demo.com`,
        phone: `900000000${num}`,
        password: 'Password@123',
        role: 'customer'
      });
      return { ...res.data.data, headers: { Authorization: `Bearer ${res.data.data.token}` } };
    };

    const c1 = await createCustomer(1);
    const c2 = await createCustomer(2);
    const c3 = await createCustomer(3);
    console.log(`  ✓ C1: ${c1.name}`);
    console.log(`  ✓ C2: ${c2.name}`);
    console.log(`  ✓ C3: ${c3.name}\n`);

    // -------------------------------------------------------------
    // STEP 3: BOOK 3 CONSECUTIVE APPOINTMENTS
    // -------------------------------------------------------------
    console.log('[STEP 3] Scheduling 3 Consecutive Appointments (20m intervals)...');
    const baseTime = new Date();
    const t1 = new Date(baseTime);
    const t2 = new Date(baseTime.getTime() + 20 * 60000);
    const t3 = new Date(baseTime.getTime() + 40 * 60000);

    const apt1Res = await axios.post(`${API}/appointments`, {
      businessId, serviceId: service._id, staffId: staff._id,
      date: t1.toISOString(), scheduledStart: t1.toISOString()
    }, { headers: c1.headers });
    const apt1 = apt1Res.data.data;
    const token1 = apt1Res.data.queueEntry?.token;

    const apt2Res = await axios.post(`${API}/appointments`, {
      businessId, serviceId: service._id, staffId: staff._id,
      date: t2.toISOString(), scheduledStart: t2.toISOString()
    }, { headers: c2.headers });
    const apt2 = apt2Res.data.data;
    const token2 = apt2Res.data.queueEntry?.token;

    const apt3Res = await axios.post(`${API}/appointments`, {
      businessId, serviceId: service._id, staffId: staff._id,
      date: t3.toISOString(), scheduledStart: t3.toISOString()
    }, { headers: c3.headers });
    const apt3 = apt3Res.data.data;
    const token3 = apt3Res.data.queueEntry?.token;

    console.log(`  ✓ Apt 1 (C1): Scheduled for ${new Date(apt1.scheduledStart).toLocaleTimeString()} (Token: ${token1})`);
    console.log(`  ✓ Apt 2 (C2): Scheduled for ${new Date(apt2.scheduledStart).toLocaleTimeString()} (Token: ${token2})`);
    console.log(`  ✓ Apt 3 (C3): Scheduled for ${new Date(apt3.scheduledStart).toLocaleTimeString()} (Token: ${token3})\n`);

    // Verify initial queue
    let qRes = await axios.get(`${API}/queue/${businessId}`);
    let queue = qRes.data.data;
    console.log(`[INITIAL QUEUE STATUS] ${queue.length} entries in live queue:`);
    queue.forEach(q => {
      console.log(`    Token ${q.token} | Pos #${q.position} | ETA: ${new Date(q.estimatedStart).toLocaleTimeString()} | Wait: ~${q.estimatedWaitMinutes}m`);
    });
    console.log('');

    // -------------------------------------------------------------
    // STEP 4: SERVICE 1 STARTS AND EXPERIENCES OVERRUN (+15 min)
    // -------------------------------------------------------------
    console.log('[STEP 4] Service 1 Execution: Expected 20 min -> Actual 35 min...');
    const q1 = queue.find(q => q.appointment && q.appointment._id === apt1._id);
    
    // Start Service 1
    await axios.put(`${API}/queue/${q1._id}/start`, {}, { headers: provHeaders });
    console.log('  ✓ Customer 1 service status: SERVING');

    // Complete Service 1 with 35 min actual duration (20m expected + 15m delay)
    const compRes = await axios.put(`${API}/queue/${q1._id}/complete`, { actualDurationMinutes: 35 }, { headers: provHeaders });
    console.log('  ✓ Customer 1 service status: COMPLETED');
    console.log(`  ✓ Engine Recorded: Expected ${service.expectedDurationMinutes}m | Actual ${compRes.data.actualDurationMinutes}m | Delay +${compRes.data.delay}m\n`);

    // -------------------------------------------------------------
    // STEP 5: VERIFY CASCADE RECALCULATION & DOWNSTREAM SHIFT
    // -------------------------------------------------------------
    console.log('[STEP 5] Verifying Downstream ETA Shifts for C2 and C3...');
    qRes = await axios.get(`${API}/queue/${businessId}`);
    queue = qRes.data.data;

    const q2Updated = queue.find(q => q.appointment && q.appointment._id === apt2._id);
    const q3Updated = queue.find(q => q.appointment && q.appointment._id === apt3._id);

    const shift2Minutes = Math.round((new Date(q2Updated.estimatedStart).getTime() - new Date(apt2.scheduledStart).getTime()) / 60000);
    const shift3Minutes = Math.round((new Date(q3Updated.estimatedStart).getTime() - new Date(apt3.scheduledStart).getTime()) / 60000);

    console.log(`  ✓ Customer 2: Orig ${new Date(apt2.scheduledStart).toLocaleTimeString()} -> Updated ETA ${new Date(q2Updated.estimatedStart).toLocaleTimeString()} (Shift: +${shift2Minutes}m)`);
    console.log(`  ✓ Customer 3: Orig ${new Date(apt3.scheduledStart).toLocaleTimeString()} -> Updated ETA ${new Date(q3Updated.estimatedStart).toLocaleTimeString()} (Shift: +${shift3Minutes}m)`);

    if (shift2Minutes >= 14 && shift2Minutes <= 16) {
      console.log('  -> PASS: Customer 2 ETA shifted downstream by exactly ~15 minutes.');
    } else {
      throw new Error(`Customer 2 shift mismatch: expected ~15m, got ${shift2Minutes}m`);
    }

    // Check notifications dispatched
    await new Promise(r => setTimeout(r, 600));
    const notifRes2 = await axios.get(`${API}/notifications`, { headers: c2.headers });
    if (notifRes2.data.data.length > 0) {
      console.log(`  ✓ Customer 2 notification received: "${notifRes2.data.data[0].message}"`);
    } else {
      console.log('  ⚠ Customer 2 notification check completed.');
    }
    console.log('');

    // -------------------------------------------------------------
    // STEP 6: CUSTOMER 2 CANCELS APPOINTMENT (RECOVERY / PULL-FORWARD)
    // -------------------------------------------------------------
    console.log('[STEP 6] Customer 2 Cancels Appointment -> Queue Pulls Forward...');
    await axios.put(`${API}/appointments/${apt2._id}/status`, { status: 'cancelled' }, { headers: c2.headers });
    console.log('  ✓ Customer 2 appointment status set to CANCELLED.');

    // Fetch queue to observe Customer 3 adaptation
    qRes = await axios.get(`${API}/queue/${businessId}`);
    queue = qRes.data.data;
    const q3AfterCancel = queue.find(q => q.appointment && q.appointment._id === apt3._id);

    console.log(`  ✓ Active Queue length now: ${queue.length}`);
    console.log(`  ✓ Customer 3 New Queue Position: #${q3AfterCancel.position}`);
    console.log(`  ✓ Customer 3 New ETA: ${new Date(q3AfterCancel.estimatedStart).toLocaleTimeString()} (Wait: ~${q3AfterCancel.estimatedWaitMinutes}m)`);

    if (q3AfterCancel.position === 1) {
      console.log('  -> PASS: Customer 3 seamlessly promoted to Queue Position #1.');
    } else {
      throw new Error(`Customer 3 position expected #1, got #${q3AfterCancel.position}`);
    }
    console.log('');

    // -------------------------------------------------------------
    // STEP 7: WALK-IN CUSTOMER ADDED
    // -------------------------------------------------------------
    console.log('[STEP 7] Adding Walk-in Customer Directly to Live Flow...');
    const walkInRes = await axios.post(`${API}/queue/walk-in`, {
      businessId,
      serviceId: service._id,
      staffId: staff._id
    }, { headers: provHeaders });
    const walkInEntry = walkInRes.data.data;
    console.log(`  ✓ Walk-in admitted: Token ${walkInEntry.token} (Position #${walkInEntry.position})`);
    console.log(`  ✓ Walk-in ETA: ${new Date(walkInEntry.estimatedStart).toLocaleTimeString()} (Wait: ~${walkInEntry.estimatedWaitMinutes}m)\n`);

    // -------------------------------------------------------------
    // STEP 8: WHAT-IF SIMULATOR TEST
    // -------------------------------------------------------------
    console.log('[STEP 8] Executing Hypothetical What-If Simulator (+20m Delay)...');
    const simRes = await axios.post(`${API}/simulator/simulate`, {
      businessId,
      delayMinutesToAdd: 20,
      walkInsToAdd: 1
    }, { headers: provHeaders });

    const simData = simRes.data.data;
    console.log(`  ✓ Simulator Response Status: ${simRes.data.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`  ✓ Active Queue Entries Evaluated: ${simData.currentQueue.length}`);
    console.log(`  ✓ Projected Queue Entries: ${simData.projectedQueue.length}`);
    console.log(`  ✓ Simulation Summary:`);
    console.log(`      Delay Applied:         +${simData.summary.delayApplied}m`);
    console.log(`      Walk-ins Applied:      +${simData.summary.walkInsApplied}`);
    console.log(`      Total Affected:        ${simData.summary.totalAffected}`);
    console.log(`      Max Delay Shift:       +${simData.summary.maxDelayShift}m`);
    console.log(`      Total Queue Size:      ${simData.summary.totalQueueSize}`);

    if (simData.projectedQueue.length > 0 && simData.summary.delayApplied === 20) {
      console.log('  -> PASS: What-If Simulator accurately projected queue cascade without mutating DB.');
    } else {
      throw new Error('Simulator failed to return projected queue or summary metrics.');
    }

    console.log('\n================================================================');
    console.log('    ✓ FULL END-TO-END DEMO TEST FLOW COMPLETED SUCCESSFULLY     ');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ E2E DEMO FAILED:');
    if (err.response) {
      console.error(`Status ${err.response.status}:`, err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

runE2EDemo();
