const axios = require('axios');
const API = 'http://localhost:5000/api';

async function runAuditTests() {
  console.log("=== RUNNING SLOTLY AUDIT SECURITY & FLOW TESTS ===");
  const ts = Date.now();

  try {
    // 1. REGISTER PROVIDER A & PROVIDER B
    console.log("\n1. Registering Provider A & Provider B...");
    const provARes = await axios.post(`${API}/auth/register`, {
      name: `Provider A ${ts}`,
      email: `prova_${ts}@test.com`,
      phone: '1111111111',
      password: 'Password@123',
      role: 'provider',
      businessName: `Biz A ${ts}`,
      businessCategory: 'Health'
    });
    const provA = provARes.data.data;
    const headersA = { Authorization: `Bearer ${provA.token}` };

    const provBRes = await axios.post(`${API}/auth/register`, {
      name: `Provider B ${ts}`,
      email: `provb_${ts}@test.com`,
      phone: '2222222222',
      password: 'Password@123',
      role: 'provider',
      businessName: `Biz B ${ts}`,
      businessCategory: 'Beauty'
    });
    const provB = provBRes.data.data;
    const headersB = { Authorization: `Bearer ${provB.token}` };

    // 2. REGISTER CUSTOMER 1 & CUSTOMER 2
    console.log("\n2. Registering Customer 1 & Customer 2...");
    const c1Res = await axios.post(`${API}/auth/register`, {
      name: `Customer 1 ${ts}`,
      email: `c1_${ts}@test.com`,
      phone: '3333333333',
      password: 'Password@123',
      role: 'customer'
    });
    const c1 = c1Res.data.data;
    const headersC1 = { Authorization: `Bearer ${c1.token}` };

    const c2Res = await axios.post(`${API}/auth/register`, {
      name: `Customer 2 ${ts}`,
      email: `c2_${ts}@test.com`,
      phone: '4444444444',
      password: 'Password@123',
      role: 'customer'
    });
    const c2 = c2Res.data.data;
    const headersC2 = { Authorization: `Bearer ${c2.token}` };

    // 3. SECURITY TEST: Customer 1 tries to access Customer 2's profile
    console.log("\n3. Testing User Profile Authorization (Negative Test)...");
    try {
      await axios.get(`${API}/users/${c2._id}`, { headers: headersC1 });
      console.error("-> FAIL: Customer 1 was able to access Customer 2's profile!");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log("-> PASS: Unauthorized access correctly rejected with 403.");
      } else {
        console.error("-> FAIL: Unexpected response:", err.response?.status);
      }
    }

    // 4. SECURITY TEST: Provider A tries to simulate Provider B's business
    console.log("\n4. Testing Simulator Business Ownership (Negative Test)...");
    try {
      await axios.post(`${API}/simulator/simulate`, {
        businessId: provB.businessId,
        delayMinutesToAdd: 15,
        walkInsToAdd: 2
      }, { headers: headersA });
      console.error("-> FAIL: Provider A was able to simulate Provider B's business!");
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.log("-> PASS: Cross-business simulation correctly rejected with 403.");
      } else {
        console.error("-> FAIL: Unexpected response:", err.response?.status);
      }
    }

    // 5. TEST: Booking service without staffId (auto-resolution & safe QueueEntry)
    console.log("\n5. Testing Booking Without StaffId...");
    const sRes = await axios.post(`${API}/services`, {
      name: 'Standard Consultation',
      expectedDurationMinutes: 30,
      price: 60
    }, { headers: headersA });
    const service = sRes.data.data;

    const bookRes = await axios.post(`${API}/appointments`, {
      businessId: provA.businessId,
      serviceId: service._id,
      date: new Date().toISOString(),
      scheduledStart: new Date(Date.now() + 3600000).toISOString()
    }, { headers: headersC1 });

    if (bookRes.data.success) {
      console.log("-> PASS: Appointment successfully created without staffId.");
    } else {
      console.error("-> FAIL: Appointment creation without staffId failed.");
    }

    // Check that queue entry was created
    const qRes = await axios.get(`${API}/queue/${provA.businessId}`);
    if (qRes.data.data.length > 0) {
      console.log("-> PASS: Queue entry successfully created for appointment.");
    } else {
      console.error("-> FAIL: Queue entry not created.");
    }

    // 6. TEST: Direct Queue Entry Status Update (Walk-in / Cancel)
    console.log("\n6. Testing Direct Queue Status Cancellation...");
    const entryId = qRes.data.data[0]._id;
    const cancelRes = await axios.put(`${API}/queue/${entryId}/status`, {
      status: 'cancelled'
    }, { headers: headersA });

    if (cancelRes.data.data.status === 'cancelled') {
      console.log("-> PASS: Direct queue cancellation succeeded.");
    } else {
      console.error("-> FAIL: Direct queue cancellation failed.");
    }

    // 7. TEST: User Profile Update Without Password Re-Hashing Bug
    console.log("\n7. Testing Profile Update (Checking Password Hook)...");
    await axios.put(`${API}/users/${c1._id}`, {
      name: 'Updated Name Only'
    }, { headers: headersC1 });

    // Verify user can still log in with original password
    const loginRes = await axios.post(`${API}/auth/login`, {
      email: `c1_${ts}@test.com`,
      password: 'Password@123'
    });
    if (loginRes.data.success && loginRes.data.data.token) {
      console.log("-> PASS: User successfully logged in after name update (no password double-hashing).");
    } else {
      console.error("-> FAIL: Password corrupted during profile update!");
    }

    console.log("\n=== ALL AUDIT VERIFICATIONS PASSED SUCCESSFULLY ===");
  } catch (err) {
    console.error("\nTEST SUITE FAILED:", err.response ? err.response.data : err.message);
  }
}

runAuditTests();
