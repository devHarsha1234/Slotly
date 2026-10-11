# Slotly Demo Flow & Real-World Acceptance Test

## Flow:
1. **Public Site**: User visits landing page, sees "How it works".
2. **Registration**: User 1 creates Provider account. User 2 creates Customer account.
3. **Provider Setup**: Provider creates their Business, 2 Services (General 20m, Extended 40m), and 1 Staff member.
4. **Booking**: Customer searches for Business, selects General Service, and books an appointment.
5. **Additional Booking**: A second appointment is created after the first.
6. **Queue Execution**:
   - Provider goes to Live Queue.
   - Starts first service.
   - Waits longer than the expected 20 mins (e.g. simulates taking 45 mins using an override or just waiting).
   - Completes service.
7. **Adaptive Trigger**:
   - Backend calculates delay (+25 mins).
   - Logs `ServiceRecord`.
   - Recalculates next appointment ETA.
8. **Customer View**: Customer sees their ETA has pushed back automatically.
9. **Simulator**: Provider opens Simulator, adds a hypothetic 15min delay, sees projected wait times without affecting live data.
10. **Persistence**: Reload browser, restart backend, all data remains intact.
