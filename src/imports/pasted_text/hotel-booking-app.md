Design a modern, professional, user-friendly hotel booking and rental web application UI for a platform jointly operated by five major hotel chains across North America. The product should feel polished, trustworthy, and efficient, with a clean dashboard-style layout, clear booking flows, and strong information hierarchy. The interface must be suitable for both customers and hotel employees.

Create a responsive desktop-first web app design with a premium travel-tech aesthetic. Use a clean grid, soft rounded cards, modern typography, subtle shadows, intuitive filters, and a consistent design system. The UI should not look like a generic travel site; it should feel like a hotel operations + customer reservation platform.

Main goals of the application:
1. Customers can search room availability in real time using multiple criteria and instantly see updated results when any filter changes.
2. Customers can book rooms online.
3. Hotel employees can manage customers, employees, hotels, rooms, bookings, rentings, and payments.
4. Employees can convert a booking into a renting during check-in.
5. Employees can create a direct renting for walk-in customers without a prior booking.
6. Users can view two SQL views in a visual, non-technical way.
7. The UI must be form-based and friendly for non-technical users, with dropdowns, radio buttons, date pickers, toggles, tables, cards, badges, and modal dialogs.

Design the following pages/screens and components:

1. Landing / Home Page
- Elegant hero section with hotel imagery or abstract luxury-travel background
- Clear call-to-action buttons: “Search Rooms”, “Book Now”, “Employee Portal”
- Quick hotel search bar
- Featured hotel chains
- Brief explanation of real-time room availability
- Trust indicators and contact/support footer

2. Customer Search & Availability Page
This is the core page.
Create a dynamic search interface where available rooms update instantly when criteria change.

Filters required:
- Booking/renting start date
- Booking/renting end date
- Room capacity
- Area / location
- Hotel chain
- Hotel category (1-star to 5-star)
- Total number of rooms in the hotel
- Room price range

Use:
- Date pickers for dates
- Dropdowns for hotel chain, area, category, capacity
- Slider for price range
- Number range input or slider for total number of rooms in hotel
- Live filter chips/tags showing active criteria
- “Clear all filters” button

Search results section:
- Card or table layout for available rooms
- Show hotel name, hotel chain, star category, room type/capacity, price per night, amenities, view type, extension availability, room condition/problems, hotel address
- Status badge: “Available”
- Buttons: “View Details”, “Book Room”, “Rent Now”
- Real-time refreshing feel
- Map preview panel optional

3. Room Details Page / Modal
- Large image or placeholder gallery
- Full room details
- Amenities list with icons (TV, air conditioning, fridge, etc.)
- Capacity
- Sea view / mountain view badges
- Extendable or not
- Any room issues/damages shown clearly
- Hotel info card
- Price summary
- “Book this room” and “Rent this room” CTA buttons

4. Booking Flow
Multi-step booking form for customers:
- Step 1: Customer information
  - Full name
  - Address
  - ID type (SSN / SIN / driver’s licence) using dropdown or radio buttons
- Step 2: Registration date auto-filled or displayed
- Step 3: Review room and stay details
- Step 4: Confirmation page

Include:
- Progress stepper
- Booking summary sidebar
- Error validation states
- Success confirmation state with booking reference number

5. Customer Portal / My Bookings
- View upcoming and past bookings
- Booking cards/table with statuses
- Booking details panel
- Cancel or modify booking action if desired
- Clean archive/history section

6. Employee Portal Dashboard
Role-based internal dashboard for hotel staff.
Style should be more operational/admin-focused but still modern.

Sections/cards:
- Today’s arrivals
- Active rentings
- Pending bookings to check in
- Walk-in customers
- Payment actions
- Room issues/damages alerts
- Quick actions panel

Quick action buttons:
- Convert booking to renting
- Create direct renting
- Register customer
- Record payment
- Add/edit room
- Add/edit hotel
- Add/edit employee

7. Convert Booking to Renting Screen
- Search booking by booking ID, customer name, or room
- Show booking details in a summary card
- Assign employee handling check-in
- Button: “Convert to Renting”
- Confirmation modal
- New renting record summary

8. Direct Renting / Walk-In Customer Screen
- Employee creates a renting without prior booking
- Search available rooms for walk-in dates
- Select customer or create new customer
- Select room
- Assign employee handling check-in
- Confirm renting
- Add payment option

9. Payment Entry Screen
- Employee-facing form
- Select renting record
- Enter payment amount
- Payment method dropdown
- Payment date
- Confirmation state
- Keep it simple since payment history does not need deep archival emphasis

10. Admin / Management CRUD Screens
Create clean management pages for insert / update / delete of:
- Customers
- Employees
- Hotels
- Rooms

Each management page should include:
- Search bar
- Data table with filters
- “Add New” button
- Edit and delete row actions
- Side panel or modal form for add/edit
- Confirmation modal for deletion

Customer fields:
- Full name
- Address
- ID type
- Registration date

Employee fields:
- Full name
- Address
- SSN/SIN
- Role/position
- Assigned hotel

Hotel fields:
- Hotel chain
- Category (1 to 5 stars)
- Number of rooms
- Address
- Contact email
- Contact phone
- Manager assignment

Room fields:
- Hotel
- Price
- Amenities
- Capacity
- Sea view / mountain view
- Extendable yes/no
- Problems/damages
- Availability status

11. Hotel Chain Management Page
- List of 5 hotel chains
- Central office address
- Number of hotels
- Contact emails
- Contact phone numbers
- Expandable list of hotels under each chain

12. SQL Views Screen
Present two SQL views in a user-friendly, visual way without exposing raw SQL.
Example style:
- Read-only analytics/report cards
- Filterable data tables
- Short explanation header: “Business Insights”
- Tabs: “View 1” and “View 2”
- Include export button and search input

13. Archive / History Screen
- Booking history
- Renting history
- Read-only archive table
- Keep old records preserved even if linked room/customer is deleted
- Highlight archival integrity and record permanence

Important UI/UX requirements:
- Use appropriately designed forms, not SQL-like interfaces
- Use dropdowns, radio buttons, toggles, date pickers, sliders, tables, tabs, modals, cards, and badges
- Users should never need SQL knowledge
- Strong visual separation between customer-facing and employee-facing areas
- Customer side should feel warm, premium, and inviting
- Employee side should feel efficient, structured, and operational
- Include clear empty states, validation errors, success states, and confirmation dialogs
- Show that room results update dynamically as filters change
- Include responsive layouts for desktop and tablet
- Accessible color contrast and clear labels

Design system guidance:
- Style: premium hospitality + modern SaaS dashboard
- Color palette: deep navy, warm beige, soft white, muted gold accents, cool gray for admin tables
- Typography: elegant but readable
- Components: rounded cards, subtle elevation, icon-supported metadata, status badges, sticky filter sidebar, top nav, left admin sidebar
- Include realistic placeholder data
- Use polished UI patterns suitable for a university database application demo

Deliver a full UI concept with high-fidelity wireframes/mockups for the main pages, reusable components, and a consistent design system.