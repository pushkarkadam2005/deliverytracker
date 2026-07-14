# System Design Write-Up: Last-Mile Delivery Tracker

This document details the core architectural engines and operational workflows of the Last-Mile Delivery Tracker platform.

---

## 1. Rate Calculation Engine
The pricing engine calculates delivery charges dynamically, adhering to configured business rules and avoiding hardcoded logic:
*   **Volumetric Weight Calculation:** Calculated based on the package dimensions ($L \times B \times H \text{ cm}$) divided by a standard volumetric constant:
    $$\text{Volumetric Weight (kg)} = \frac{\text{Length} \times \text{Width} \times \text{Height}}{5000}$$
*   **Billable Weight Determination:** The system compares the actual physical weight against the calculated volumetric weight, charging on the higher of the two:
    $$\text{Billable Weight} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$
*   **Rate Selection:** The engine looks up the active zone-to-zone `RateCard` matching the order type (B2B or B2C) and weight tier.
*   **Total Charge Computation:**
    *   **Base Charge:** Standard rate configured on the rate card.
    *   **Weight Surcharge:** Charged as $\text{Billable Weight} \times \text{Price per Kg}$.
    *   **Fuel Surcharge:** Computed as a percentage of the base charge: $\text{Base Charge} \times \frac{\text{Fuel Surcharge \%}}{100}$.
    *   **COD Surcharge:** Added if the payment type is Cash on Delivery (`COD`).
    *   **GST & Final Total:** Applicable taxes (e.g., 18% GST) are calculated on the sum of all components to determine the final amount shown to the customer before order confirmation.

---

## 2. Zone Detection Approach
Geographic routing and pricing are structured around a database-driven zone detection framework:
1.  **Pincode Mapping:** During order booking, the customer inputs pickup and delivery pincodes. The system queries the `Area` table to resolve these pincodes.
2.  **Zone Resolution:** Each `Area` is mapped to a parent `Zone` entity (e.g., *North Zone*, *West Zone*). This allows granular, admin-configurable geographic boundaries.
3.  **Intra vs. Inter-Zone Routing:**
    *   If pickup and delivery zones are identical, the engine treats it as an **Intra-Zone** delivery.
    *   If they differ, it is matched as an **Inter-Zone** delivery.
    The matched zones are then used to look up the correct pricing `RateCard` mapping origin and destination zones.

---

## 3. Auto-Assignment Logic
The auto-assignment flow uses a spatial matching algorithm to dispatch packages:
1.  **Candidate Selection:** The system queries the database for all delivery agents whose availability status is `AVAILABLE` and who are on active duty.
2.  **Distance Metric (Euclidean Distance):** The engine retrieves the coordinates (latitude and longitude) of the shipment's pickup area and compares them against each candidate agent's current location:
    $$\text{Distance} = \sqrt{(\text{Agent Lat} - \text{Pickup Lat})^2 + (\text{Agent Lng} - \text{Pickup Lng})^2}$$
3.  **Dispatch Allocation:**
    *   The agent with the minimum Euclidean distance is selected.
    *   The system creates an `OrderAssignment` record in the `ASSIGNED` state.
    *   The matched agent's status is toggled to `BUSY` to prevent double-booking.
    *   The shipment's status is updated to `ASSIGNED`.

---

## 4. Failed Delivery Handling
The platform implements a robust lifecycle for handling delivery exceptions:
1.  **Milestone Failure Logging:** If a delivery attempt fails (e.g., recipient unavailable), the driver updates the status to `FAILED`, inputting remarks and location.
2.  **State Clean-Up & Driver Release:**
    *   The shipment status transitions to `FAILED`.
    *   The active `OrderAssignment` is closed and updated to `REASSIGNED`.
    *   The delivery agent's status is immediately reset to `AVAILABLE`, freeing them to accept other deliveries.
3.  **Customer Notification:** An asynchronous application event is published, triggering an in-app alert and sending an email detailing the failed attempt.
4.  **Rescheduling Lifecycle:** 
    *   The customer can reschedule the failed delivery for a future date/time.
    *   Rescheduling resets the shipment status back to `CREATED`.
    *   The auto-assignment algorithm runs again, calculating distances and matching the shipment to the nearest available driver (which could be the same driver if they are closest, or a different one).
