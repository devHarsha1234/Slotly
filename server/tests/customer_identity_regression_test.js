const axios = require('axios');

const API = process.env.API_URL || 'http://localhost:5000/api';

async function runCustomerIdentityRegressionTest() {
  console.log('================================================================');
  console.log('    CUSTOMER IDENTITY & QUEUE ISOLATION REGRESSION TEST SUITE   ');
  console.log('================================================================');
  console.log('Goal: Guarantee that Customer A and Customer B never receive');
  console.log('      each other\'s queue entries, tokens, or positions.');
  console.log('================================================================\n');

  const ts = Date.now();

  try {
    // -------------------------------------------------------------
    // 1. SETUP PROVIDER, BUSINESS & SERVICE
    // -------------------------------------------------------------
    console.log('[STEP 1] Provisioning Business & Catalog...');
    const provRes = await axios.post(`${API}/auth/register`, {
      name: `Dr. Mahesh ${ts}`,
      email: `prov_${ts}@regtest.com`,
      phone: '9800000000',
      password: 'Password@123',
      role: 'provider',
      businessName: `Metro Dental Clinic ${ts}`,
      businessCategory: 'Health'
    });
    const provider = provRes.data.data;
    const businessId = provider.businessId;
    const provHeaders = { Authorization: `Bearer ${provider.token}` };

    const sRes = await axios.post(`${API}/services`, {
      name: 'Standard Consultation',
      expectedDurationMinutes: 20,
      price: 60
    }, { headers: provHeaders });
    const service = sRes.data.data;

    console.log(`  ✓ Business: ${provider.businessName} (ID: ${businessId})`);
    console.log(`  ✓ Service: ${service.name} (20 min)\n`);

    // -------------------------------------------------------------
    // 2. REGISTER CUSTOMER A (UMESH) & CUSTOMER B (AJIT)
    // -------------------------------------------------------------
    console.log('[STEP 2] Registering Customer A (Umesh) and Customer B (Ajit)...');
    const umeshRes = await axios.post(`${API}/auth/register`, {
      name: `Umesh Patil ${ts}`,
      email: `umesh_${ts}@regtest.com`,
      phone: '9811111111',
      password: 'Password@123',
      role: 'customer'
    });
    const umesh = umeshRes.data.data;
    const umeshHeaders = { Authorization: `Bearer ${umesh.token}` };

    const ajitRes = await axios.post(`${API}/auth/register`, {
      name: `Ajit Bhosale ${ts}`,
      email: `ajit_${ts}@regtest.com`,
      phone: '9822222222',
      password: 'Password@123',
      role: 'customer'
    });
    const ajit = ajitRes.data.data;
    const ajitHeaders = { Authorization: `Bearer ${ajit.token}` };

    console.log(`  ✓ Customer A: ${umesh.name} (ID: ${umesh._id})`);
    console.log(`  ✓ Customer B: ${ajit.name} (ID: ${ajit._id})\n`);

    // -------------------------------------------------------------
    // 3. BOOK CONSECUTIVE APPOINTMENTS
    // -------------------------------------------------------------
    console.log('[STEP 3] Booking sequential appointments for Umesh and Ajit...');
    const now = new Date();
    const timeA = new Date(now.getTime() + 10 * 60000);
    const timeB = new Date(now.getTime() + 30 * 60000);

    const aptARes = await axios.post(`${API}/appointments`, {
      businessId,
      serviceId: service._id,
      date: timeA.toISOString(),
      scheduledStart: timeA.toISOString()
    }, { headers: umeshHeaders });
    const aptA = aptARes.data.data;

    const aptBRes = await axios.post(`${API}/appointments`, {
      businessId,
      serviceId: service._id,
      date: timeB.toISOString(),
      scheduledStart: timeB.toISOString()
    }, { headers: ajitHeaders });
    const aptB = aptBRes.data.data;

    // Verify queue entries
    const qRes = await axios.get(`${API}/queue/${businessId}`);
    const queue = qRes.data.data;
    const entryUmesh = queue.find(q => q.customer?._id === umesh._id || q.appointment?._id === aptA._id);
    const entryAjit = queue.find(q => q.customer?._id === ajit._id || q.appointment?._id === aptB._id);

    console.log(`  ✓ Umesh Token: ${entryUmesh.token} (Pos #${entryUmesh.position})`);
    console.log(`  ✓ Ajit Token:  ${entryAjit.token} (Pos #${entryAjit.position})`);

    // Assert token uniqueness
    if (entryUmesh.token === entryAjit.token) {
      throw new Error(`CRITICAL FAILURE: Token collision detected between Umesh and Ajit (${entryUmesh.token})`);
    }
    console.log('  -> PASS: Umesh and Ajit have unique, distinct tokens.\n');

    // -------------------------------------------------------------
    // 4. PROVIDER STARTS UMESH'S SERVICE (UMESH -> SERVING)
    // -------------------------------------------------------------
    console.log(`[STEP 4] Provider starts service for Umesh (${entryUmesh.token})...`);
    await axios.put(`${API}/queue/${entryUmesh._id}/start`, {}, { headers: provHeaders });
    console.log('  ✓ Umesh status: SERVING\n');

    // -------------------------------------------------------------
    // 5. TEST AUTHORITATIVE CUSTOMER ENDPOINT FOR UMESH
    // -------------------------------------------------------------
    console.log('[STEP 5] Querying /api/queue/customer/active with Umesh\'s credentials:');
    const activeUmeshRes = await axios.get(`${API}/queue/customer/active`, { headers: umeshHeaders });
    const activeUmesh = activeUmeshRes.data.data;

    console.log(`  ✓ Received Active Entry: ${activeUmesh ? 'YES' : 'NO'}`);
    console.log(`  ✓ Displayed Token:        ${activeUmesh?.entry?.token}`);
    console.log(`  ✓ Displayed Position:     ${activeUmesh?.position}`);
    console.log(`  ✓ Displayed Status:       ${activeUmesh?.entry?.status}`);
    console.log(`  ✓ Serving Token:          ${activeUmesh?.servingToken}`);

    if (!activeUmesh) {
      throw new Error('FAIL: Umesh has an active serving entry, but /queue/customer/active returned null!');
    }
    if (activeUmesh.entry.token !== entryUmesh.token) {
      throw new Error(`FAIL: Umesh received wrong token! Expected ${entryUmesh.token}, got ${activeUmesh.entry.token}`);
    }
    if (activeUmesh.entry.status !== 'serving') {
      throw new Error(`FAIL: Umesh status expected 'serving', got ${activeUmesh.entry.status}`);
    }
    if (activeUmesh.entry.token === entryAjit.token) {
      throw new Error('FAIL: Umesh received Ajit\'s token!');
    }
    console.log('  -> PASS: Umesh correctly and authoritatively received his own serving queue entry.\n');

    // -------------------------------------------------------------
    // 6. TEST AUTHORITATIVE CUSTOMER ENDPOINT FOR AJIT
    // -------------------------------------------------------------
    console.log('[STEP 6] Querying /api/queue/customer/active with Ajit\'s credentials:');
    const activeAjitRes = await axios.get(`${API}/queue/customer/active`, { headers: ajitHeaders });
    const activeAjit = activeAjitRes.data.data;

    console.log(`  ✓ Received Active Entry: ${activeAjit ? 'YES' : 'NO'}`);
    console.log(`  ✓ Displayed Token:        ${activeAjit?.entry?.token}`);
    console.log(`  ✓ Displayed Position:     ${activeAjit?.position}`);
    console.log(`  ✓ Displayed Status:       ${activeAjit?.entry?.status}`);
    console.log(`  ✓ Serving Token:          ${activeAjit?.servingToken}`);

    if (!activeAjit) {
      throw new Error('FAIL: Ajit has an active waiting entry, but /queue/customer/active returned null!');
    }
    if (activeAjit.entry.token !== entryAjit.token) {
      throw new Error(`FAIL: Ajit received wrong token! Expected ${entryAjit.token}, got ${activeAjit.entry.token}`);
    }
    if (activeAjit.entry.status !== 'waiting') {
      throw new Error(`FAIL: Ajit status expected 'waiting', got ${activeAjit.entry.status}`);
    }
    if (activeAjit.entry.token === entryUmesh.token) {
      throw new Error('FAIL: Ajit received Umesh\'s token!');
    }
    if (activeAjit.servingToken !== entryUmesh.token) {
      throw new Error(`FAIL: Ajit servingToken expected ${entryUmesh.token}, got ${activeAjit.servingToken}`);
    }
    console.log('  -> PASS: Ajit received his own token (A-yyy) AND accurately saw Umesh (A-xxx) as Currently Serving without confusion.\n');

    // -------------------------------------------------------------
    // 7. TEST UNAUTHENTICATED / INACTIVE CUSTOMER
    // -------------------------------------------------------------
    console.log('[STEP 7] Testing Customer with No Active Bookings...');
    const inactiveCustomerRes = await axios.post(`${API}/auth/register`, {
      name: `Inactive User ${ts}`,
      email: `inactive_${ts}@regtest.com`,
      phone: '9833333333',
      password: 'Password@123',
      role: 'customer'
    });
    const inactiveUser = inactiveCustomerRes.data.data;
    const inactiveHeaders = { Authorization: `Bearer ${inactiveUser.token}` };

    const activeInactiveRes = await axios.get(`${API}/queue/customer/active`, { headers: inactiveHeaders });
    console.log(`  ✓ Response for user with 0 bookings: ${JSON.stringify(activeInactiveRes.data.data)}`);
    if (activeInactiveRes.data.data !== null) {
      throw new Error('FAIL: Inactive user received a queue entry belonging to someone else!');
    }
    console.log('  -> PASS: User with no active entries correctly receives null.\n');

    // -------------------------------------------------------------
    // 8. TEST POSITION COMPACTION ON SERVICE COMPLETION
    // -------------------------------------------------------------
    console.log('[STEP 8] Completing Umesh -> Verifying Ajit position compaction...');
    await axios.put(`${API}/queue/${entryUmesh._id}/complete`, { actualDurationMinutes: 20 }, { headers: provHeaders });

    const ajitAfterCompRes = await axios.get(`${API}/queue/customer/active`, { headers: ajitHeaders });
    const ajitAfterComp = ajitAfterCompRes.data.data;
    console.log(`  ✓ Ajit New Position: #${ajitAfterComp.position}`);

    if (ajitAfterComp.position !== 1) {
      throw new Error(`FAIL: Ajit position expected #1 after front completed, got #${ajitAfterComp.position}`);
    }
    console.log('  -> PASS: Ajit successfully compacted to Position #1.\n');

    console.log('================================================================');
    console.log('    ✓ ALL CUSTOMER IDENTITY & ISOLATION REGRESSION TESTS PASSED ');
    console.log('================================================================\n');

  } catch (err) {
    console.error('\n❌ REGRESSION TEST FAILED:');
    if (err.response) {
      console.error(`Status ${err.response.status}:`, err.response.data);
    } else {
      console.error(err.message);
    }
    process.exit(1);
  }
}

runCustomerIdentityRegressionTest();
