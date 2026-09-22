-- ==============================================================================
-- CoHo Housing Society (Emerald Heights CHS) - Database Audit, Cleanup & Reseed
-- ==============================================================================
-- HOW TO RUN THIS SCRIPT IN SUPABASE:
-- 1. Open your Supabase Project Dashboard: https://supabase.com/dashboard/project/sbzbitbznoiigzxugvph
-- 2. Click on "SQL Editor" in the left-hand sidebar.
-- 3. Click "+ New query" (or open a blank query tab).
-- 4. Copy and paste the entire contents of this file into the SQL Editor.
-- 5. Click the green "Run" button (or press Command/Ctrl + Enter).
-- 6. You will see "Success. No rows returned" or statement results.
-- 7. Return to the app and click "Reset to Default" (or reload) to sync immediately.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- STEP 1: Ensure Tables and Required Schema Exist
-- ------------------------------------------------------------------------------

-- Ensure document_requests table exists with 'unavailable' status support
CREATE TABLE IF NOT EXISTS public.document_requests (
  id TEXT PRIMARY KEY,
  flat_id TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  delivery_email TEXT,
  document_type TEXT NOT NULL,
  document_name TEXT NOT NULL,
  copy_type TEXT NOT NULL DEFAULT 'digital',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'fulfilled' | 'unavailable' | 'not_available'
  requested_at TEXT NOT NULL,
  fulfilled_at TEXT,
  fulfilled_file_name TEXT,
  note TEXT,
  not_available_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure facility_bookings table exists
CREATE TABLE IF NOT EXISTS public.facility_bookings (
  id TEXT PRIMARY KEY,
  flat_id TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  facility TEXT NOT NULL,
  date TEXT NOT NULL,
  time_slot TEXT NOT NULL,
  purpose TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'approved' | 'rejected'
  created_at TEXT NOT NULL,
  approved_at TEXT,
  admin_notes TEXT
);

-- Ensure complaints table exists
CREATE TABLE IF NOT EXISTS public.complaints (
  id TEXT PRIMARY KEY,
  flat_id TEXT NOT NULL,
  flat_number TEXT NOT NULL,
  resident_name TEXT NOT NULL,
  category TEXT NOT NULL,
  category_label TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'in_progress' | 'resolved'
  created_at TEXT NOT NULL,
  updated_at TEXT,
  admin_response TEXT
);

-- Enable Row Level Security (RLS) and permissive public demo policies
ALTER TABLE public.document_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facility_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public access to document_requests') THEN
    CREATE POLICY "Public access to document_requests" ON public.document_requests FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public access to facility_bookings') THEN
    CREATE POLICY "Public access to facility_bookings" ON public.facility_bookings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public access to complaints') THEN
    CREATE POLICY "Public access to complaints" ON public.complaints FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;


-- ------------------------------------------------------------------------------
-- STEP 2: Clean Out Orphaned and Stale Ad-Hoc Test Data
-- ------------------------------------------------------------------------------

DELETE FROM public.document_requests;
DELETE FROM public.facility_bookings;
DELETE FROM public.complaints;
DELETE FROM public.maintenance_bills;
DELETE FROM public.documents;
DELETE FROM public.society_rules;
DELETE FROM public.notices;
DELETE FROM public.meetings;
DELETE FROM public.sponsorships;
DELETE FROM public.flats;


-- ------------------------------------------------------------------------------
-- STEP 3: Reseed 5 Core Flats + 1 Managing Committee Admin Flat
-- ------------------------------------------------------------------------------

INSERT INTO public.flats (
  id, flat_number, wing, building_name, resident_name, email, phone, role, is_owner, possession_date, parking_slot
) VALUES
  ('flat-admin', 'MC-Office', 'Society Office', 'Emerald Heights CHS Ltd.', 'Managing Committee (Secretary - Rajesh Shetty)', 'committee@emeraldheights.org', '+91 22 2640 9988', 'admin', true, '01 Jan 2015', 'Admin Reserved (P-01)'),
  ('flat-a101', 'A-101', 'Building A', 'Emerald Heights CHS Ltd.', 'Pooja Sharma', 'pooja.sharma@outlook.com', '+91 98450 11223', 'resident', true, '05 Jan 2019', 'P-04 (Covered Ground)'),
  ('flat-b402', 'B-402', 'Building B', 'Emerald Heights CHS Ltd.', 'Rajesh Shetty', 'rajesh.shetty@emeraldheights.org', '+91 98200 44201', 'resident', true, '10 Mar 2018', 'P-42 (Covered Ground)'),
  ('flat-b204', 'B-204', 'Building B', 'Emerald Heights CHS Ltd.', 'Ananya Iyer', 'ananya.iyer@fintech.in', '+91 98208 22208', 'resident', true, '01 Dec 2018', 'P-49 (Basement 2)'),
  ('flat-c303', 'C-303', 'Building C', 'Emerald Heights CHS Ltd.', 'Vikram Malhotra', 'vikram.m@investments.in', '+91 98210 33311', 'resident', true, '01 Nov 2020', 'P-70 (Basement 2)'),
  ('flat-c102', 'C-102', 'Building C', 'Emerald Heights CHS Ltd.', 'Sunita Deshmukh', 'sunita.deshmukh@gmail.com', '+91 98190 77654', 'resident', true, '15 Jul 2021', 'P-58 (Basement 1)');


-- ------------------------------------------------------------------------------
-- STEP 4: Reseed 3 Notices (1 Urgent Water Interruption, 1 General, 1 Maintenance)
-- ------------------------------------------------------------------------------

INSERT INTO public.notices (
  id, title, content, category, posted_at, posted_by, is_pinned, valid_till, translations
) VALUES
  (
    'notice-1',
    'Overhead Water Tank Cleaning & Supply Interruption (Tomorrow)',
    'Please be informed that semi-annual cleaning and sanitization of the overhead water tanks for Wings A, B, and C will take place tomorrow, Thursday, from 10:00 AM to 02:00 PM. Water supply will be suspended during this window. Residents are kindly advised to store adequate water for morning/afternoon usage.',
    'urgent',
    '02 Oct 2026, 06:15 PM',
    'Facilities & Maintenance Sub-Committee',
    true,
    null,
    '{"hi":{"title":"पानी की आपूर्ति में रुकावट — कल","content":"टैंक की निर्धारित सफाई और रखरखाव के लिए कल सुबह 10:00 बजे से दोपहर 2:00 बजे तक पानी की आपूर्ति बाधित रहेगी। कृपया पहले से पानी जमा कर लें। असुविधा के लिए हमें खेद है।"},"mr":{"title":"पाणी पुरवठा खंडित — उद्या","content":"टाकीची नियोजित स्वच्छता आणि देखभालीसाठी उद्या सकाळी १०:०० ते दुपारी २:०० वाजेपर्यंत पाणीपुरवठा बंद राहील. कृपया पाण्याचा साठा अगोदर करून ठेवा."}}'::jsonb
  ),
  (
    'notice-2',
    'Festive Season Security & Courier Parcel Locker Guidelines',
    'With the festive parcel surge, all courier deliveries will be held at the Smart Delivery Kiosk located near the main security gate. Guards will scan packages and residents will receive an OTP for instant self-pickup. Valuables/food deliveries may still proceed directly to flat doors.',
    'general',
    '20 Sep 2026, 04:30 PM',
    'Security Sub-Committee',
    false,
    null,
    '{"hi":{"title":"त्योहारी सीजन सुरक्षा एवं कूरियर पार्सल लॉकर दिशानिर्देश","content":"त्योहारी मौसम में पार्सल की अधिक संख्या को देखते हुए सभी कूरियर डिलीवरी मुख्य सुरक्षा गेट के पास स्थित स्मार्ट डिलीवरी कियोस्क पर रखी जाएंगी।"},"mr":{"title":"सणासुदीच्या काळातील सुरक्षा आणि कुरिअर पार्सल नियमावली","content":"सणासुदीच्या काळात वाढत्या पार्सल डिलिव्हरीच्या पार्श्वभूमीवर सर्व कुरिअर पार्सल मुख्य प्रवेशद्वाराजवळील कियोस्कवर ठेवले जातील."}}'::jsonb
  ),
  (
    'notice-3',
    'Rooftop Solar Grid Net-Metering Commissioning Completed',
    'The Managing Committee is delighted to share that the 45kW rooftop solar photovoltaic system has received final grid synchronization approval from Tata Power / MSEDCL. Common area lighting and elevator power will now run 65% on renewable solar energy, resulting in projected monthly savings of ₹42,000 on common electricity bills.',
    'maintenance',
    '28 Sep 2026, 11:00 AM',
    'Managing Committee',
    false,
    null,
    '{"hi":{"title":"रूफटॉप सोलर ग्रिड कमीशनिंग सफलतापूर्वक संपन्न","content":"प्रबंध समिति को यह बताते हुए हर्ष हो रहा है कि हमारे 45kW रूफटॉप सोलर सिस्टम को ग्रिड से जोड़ दिया गया है।"},"mr":{"title":"छतावरील सोलर ग्रीडचे काम पूर्ण झाले","content":"व्यवस्थापन समितीला हे सांगताना आनंद होत आहे की ४५ किलोवॅट क्षमतेच्या सोलर पॅनेल प्रणालीला मंजुरी मिळाली आहे."}}'::jsonb
  );


-- ------------------------------------------------------------------------------
-- STEP 5: Reseed 2 AGM Meeting Records with Full Minutes and Resolutions
-- ------------------------------------------------------------------------------

INSERT INTO public.meetings (
  id, title, date, time, venue, agenda, attendee_count, minutes_content, ai_summary, attachments
) VALUES
  (
    'meeting-agm-2026',
    '52nd Annual General Meeting (AGM) - 2026',
    '15 Aug 2026',
    '10:30 AM – 01:15 PM',
    'Main Clubhouse & Virtual Webex Link',
    '["Review & adoption of audited financial statements for FY 2025-26", "Award of contract for exterior structural waterproofing & painting", "Sanctioning of 8 dedicated EV charging points across Basement 1", "Appointment of Statutory Auditor for FY 2026-27"]'::jsonb,
    74,
    'The 52nd AGM was convened on 15 Aug 2026 with 74 members present. Chairman Mr. Suresh Mehta presided.
1. Audited financials for FY 2025-26 showing net society surplus of ₹8.4 Lakhs were approved unanimously.
2. Technical evaluation of 3 waterproofing vendors was presented. Contract awarded to Asian Paints Project Services for ₹34.5 Lakhs from Sinking Fund with no special levy on residents.
3. Proposal to install 8 Tata Power smart EV chargers in Basement 1 approved on revenue-share model.
4. M/s S.R. Patki & Associates reappointed as Statutory Auditor.',
    '{"overview":"52nd AGM attended by 74 members approved FY25-26 accounts with ₹8.4L surplus, sanctioned building exterior waterproofing without additional levy, and authorized 8 new EV charging bays.","keyDecisions":["Unanimously passed audited financial accounts for FY 2025-26 with ₹8.4L surplus.","Awarded ₹34.5L exterior waterproofing contract to Asian Paints funded through Sinking Fund.","Approved 8 new EV charging points in Basement 1 on revenue-share terms."],"actionItems":[{"task":"Execute contract agreement with Asian Paints","assignee":"Secretary Rajesh Shetty","deadline":"31 Aug 2026"},{"task":"Coordinate DISCOM net-metering for EV chargers","assignee":"Facilities Sub-committee","deadline":"15 Sep 2026"}]}'::jsonb,
    '[]'::jsonb
  ),
  (
    'meeting-agm-2025',
    '51st Annual General Meeting (AGM) - 2025',
    '17 Aug 2025',
    '10:00 AM – 12:45 PM',
    'Main Clubhouse',
    '["Review & adoption of audited balance sheet for FY 2024-25", "Renewal of comprehensive AMC for OTIS elevators across Wings A, B, and C", "Security enhancement: installation of biometric RFID boom barriers & 32 HD IP CCTV cameras", "Approval of revised parking bye-laws and visitor vehicle clamping fee"]'::jsonb,
    68,
    'The 51st AGM of Emerald Heights CHS was held on 17 Aug 2025 with 68 flat owners in attendance.
1. Financial statements for FY 2024-25 were adopted with zero audit qualifications.
2. Managing Committee authorized to enter into a 3-year comprehensive AMC with OTIS Elevators at ₹4.8 Lakhs/year including full parts replacement.
3. Security automation project sanctioned at ₹6.2 Lakhs for RFID tag gate barriers and 32 full-HD CCTV cameras with 60-day recording retention.
4. Revised parking rule with ₹500 clamping penalty for unauthorized parking ratified.',
    '{"overview":"51st AGM approved FY24-25 balance sheet, renewed a 3-year comprehensive AMC with OTIS Elevators, and authorized RFID gate barrier and 32 HD CCTV security automation.","keyDecisions":["Adopted audited balance sheet for FY 2024-25 without objections.","Approved 3-year OTIS elevator comprehensive maintenance contract at ₹4.8L/year.","Sanctioned ₹6.2L for RFID boom barriers and 32 HD IP CCTV cameras at all gates."],"actionItems":[{"task":"Sign 3-year agreement with OTIS Elevator India","assignee":"Secretary Rajesh Shetty","deadline":"31 Aug 2025"},{"task":"Complete CCTV installation and resident RFID issuance","assignee":"Security Committee","deadline":"30 Sep 2025"}]}'::jsonb,
    '[]'::jsonb
  );


-- ------------------------------------------------------------------------------
-- STEP 6: Reseed 3 Festival Drives (Anant Chaturdashi, Navratri, Diwali)
-- (Ganesh Utsav retired; all donations from real residents; mathematically exact)
-- ------------------------------------------------------------------------------

INSERT INTO public.sponsorships (
  id, title, description, festival_date, target_amount, collected_amount, banner_image, tiers, donations
) VALUES
  (
    'camp-anant-2026',
    'Anant Chaturdashi Immersion & Visarjan Procession',
    'Eco-friendly immersion ceremony at the society artificial water tank, traditional Dhol-Tasha troop performance, evening community Prasad distribution, and flower shower procession across central society podium.',
    '28 Sep 2026',
    75000,
    35000,
    'https://images.unsplash.com/photo-1567653418876-5bb0e566e1c2?w=800&auto=format&fit=crop&q=80',
    '[
      {"name":"Grand Procession Patron (Gold)","amount":15000,"perks":"VIP front-row seating + Special family Maha-Aarti slot + Family name on central festival banner","slotsAvailable":2,"slotsFilled":1},
      {"name":"Dhol Tasha & Brass Band Supporter (Silver)","amount":5000,"perks":"Special recognition during procession + 5 family prasad boxes + Stage felicitation","slotsAvailable":6,"slotsFilled":4},
      {"name":"Eco-Visarjan Tank & Flower Sponsor (Bronze)","amount":2000,"perks":"Name listed in festival souvenir booklet + Floral offering dedicated in family name","slotsAvailable":15,"slotsFilled":0}
    ]'::jsonb,
    '[
      {"id":"don-ac-1","donorName":"Vikram Malhotra","flatNumber":"C-303","amount":15000,"tierName":"Grand Procession Patron (Gold)","donatedAt":"22 Sep 2026"},
      {"id":"don-ac-2","donorName":"Rajesh Shetty","flatNumber":"B-402","amount":5000,"tierName":"Dhol Tasha & Brass Band Supporter (Silver)","donatedAt":"23 Sep 2026"},
      {"id":"don-ac-3","donorName":"Pooja Sharma","flatNumber":"A-101","amount":5000,"tierName":"Dhol Tasha & Brass Band Supporter (Silver)","donatedAt":"24 Sep 2026"},
      {"id":"don-ac-4","donorName":"Ananya Iyer","flatNumber":"B-204","amount":5000,"tierName":"Dhol Tasha & Brass Band Supporter (Silver)","donatedAt":"25 Sep 2026"},
      {"id":"don-ac-5","donorName":"Sunita Deshmukh","flatNumber":"C-102","amount":5000,"tierName":"Dhol Tasha & Brass Band Supporter (Silver)","donatedAt":"25 Sep 2026"}
    ]'::jsonb
  ),
  (
    'camp-navratri-2026',
    'Navratri Dandiya & Garba Mahotsav 2026',
    '9 nights of vibrant Garba and Dandiya Raas in the society central amphitheater! Live traditional orchestra, professional sound & beam lighting, authentic Gujarati Farsan stalls, daily best-dressed prizes, and grand Vijayadashami celebration.',
    '11 Oct – 19 Oct 2026',
    180000,
    64000,
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80',
    '[
      {"name":"Title Sponsor - Garba Night Stage (Gold)","amount":20000,"perks":"Dedicated stage banner with family name + Guest of Honor for lighting opening deepak + 10 complimentary Dandiya stick sets","slotsAvailable":4,"slotsFilled":2},
      {"name":"Traditional Orchestra & DJ Sponsor (Silver)","amount":8000,"perks":"Stage announcement on 3 nights + VIP seating reservation + Special Prasad hamper","slotsAvailable":8,"slotsFilled":3},
      {"name":"Dandiya Sticks & Refreshments Patron (Bronze)","amount":3000,"perks":"Family name displayed at beverage & prasad counter + Participation memento","slotsAvailable":15,"slotsFilled":0}
    ]'::jsonb,
    '[
      {"id":"don-nav-1","donorName":"Pooja Sharma","flatNumber":"A-101","amount":20000,"tierName":"Title Sponsor - Garba Night Stage (Gold)","donatedAt":"01 Oct 2026"},
      {"id":"don-nav-2","donorName":"Sunita Deshmukh","flatNumber":"C-102","amount":20000,"tierName":"Title Sponsor - Garba Night Stage (Gold)","donatedAt":"02 Oct 2026"},
      {"id":"don-nav-3","donorName":"Rajesh Shetty","flatNumber":"B-402","amount":8000,"tierName":"Traditional Orchestra & DJ Sponsor (Silver)","donatedAt":"03 Oct 2026"},
      {"id":"don-nav-4","donorName":"Ananya Iyer","flatNumber":"B-204","amount":8000,"tierName":"Traditional Orchestra & DJ Sponsor (Silver)","donatedAt":"04 Oct 2026"},
      {"id":"don-nav-5","donorName":"Vikram Malhotra","flatNumber":"C-303","amount":8000,"tierName":"Traditional Orchestra & DJ Sponsor (Silver)","donatedAt":"05 Oct 2026"}
    ]'::jsonb
  ),
  (
    'camp-diwali-2026',
    'Diwali Deepotsav & Community Illumination 2026',
    'Annual society facade fairy lighting, traditional diya lighting across all building corridors, musical sitar performance in the central amphitheater, and festive bonus hampers distribution for all 24 housekeeping and security guards.',
    '31 Oct – 02 Nov 2026',
    120000,
    28000,
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    '[
      {"name":"Security & Staff Gift Sponsor (Gold)","amount":8000,"perks":"Directly sponsor festive bonus hampers and sweets for 12 security & sanitation personnel + Felicitation plaque","slotsAvailable":10,"slotsFilled":2},
      {"name":"Society Facade & Garden Illumination (Silver)","amount":4000,"perks":"Sponsor LED fairy illumination for building entrance arch & main garden gazebos","slotsAvailable":12,"slotsFilled":3},
      {"name":"Diya & Rangoli Celebration Contributor (Bronze)","amount":2000,"perks":"Sponsor earthen diyas and eco-friendly rangoli colors for podium corridors","slotsAvailable":20,"slotsFilled":0}
    ]'::jsonb,
    '[
      {"id":"don-diw-1","donorName":"Rajesh Shetty","flatNumber":"B-402","amount":8000,"tierName":"Security & Staff Gift Sponsor (Gold)","donatedAt":"01 Oct 2026"},
      {"id":"don-diw-2","donorName":"Ananya Iyer","flatNumber":"B-204","amount":8000,"tierName":"Security & Staff Gift Sponsor (Gold)","donatedAt":"02 Oct 2026"},
      {"id":"don-diw-3","donorName":"Pooja Sharma","flatNumber":"A-101","amount":4000,"tierName":"Society Facade & Garden Illumination (Silver)","donatedAt":"03 Oct 2026"},
      {"id":"don-diw-4","donorName":"Vikram Malhotra","flatNumber":"C-303","amount":4000,"tierName":"Society Facade & Garden Illumination (Silver)","donatedAt":"04 Oct 2026"},
      {"id":"don-diw-5","donorName":"Sunita Deshmukh","flatNumber":"C-102","amount":4000,"tierName":"Society Facade & Garden Illumination (Silver)","donatedAt":"05 Oct 2026"}
    ]'::jsonb
  );


-- ------------------------------------------------------------------------------
-- STEP 7: Reseed Maintenance Bills (All October 2026 Bills Unpaid for Demo)
-- ------------------------------------------------------------------------------

INSERT INTO public.maintenance_bills (
  id, flat_id, flat_number, month_year, billing_date, due_date, items, total_amount, status, paid_at, payment_ref, payment_method, is_property_tax_included, property_tax_amount
) VALUES
  (
    'bill-2026-10-a101', 'flat-a101', 'A-101', 'October 2026', '01 Oct 2026', '15 Oct 2026',
    '[{"id":"i1","name":"Society Maintenance & Security Fee","amount":3200,"category":"maintenance"},{"id":"i2","name":"Sinking & Major Repair Fund","amount":650,"category":"sinking_fund"},{"id":"i3","name":"Water & Common Utility Charges","amount":450,"category":"water"},{"id":"i4","name":"Covered Ground Parking (P-04)","amount":500,"category":"parking"},{"id":"i5","name":"Annual Municipal Property Tax (Pro-rata)","amount":1400,"category":"property_tax"}]'::jsonb,
    6200, 'pending', null, null, null, true, 1400
  ),
  (
    'bill-2026-09-a101', 'flat-a101', 'A-101', 'September 2026', '01 Sep 2026', '15 Sep 2026',
    '[{"id":"i1","name":"Society Maintenance & Security Fee","amount":3200,"category":"maintenance"},{"id":"i2","name":"Sinking & Major Repair Fund","amount":650,"category":"sinking_fund"},{"id":"i3","name":"Water & Common Utility Charges","amount":450,"category":"water"},{"id":"i4","name":"Covered Ground Parking (P-04)","amount":500,"category":"parking"}]'::jsonb,
    4800, 'paid', '08 Sep 2026', 'RZP_202609088491', 'Razorpay', false, 0
  ),
  (
    'bill-2026-10-b402', 'flat-b402', 'B-402', 'October 2026', '01 Oct 2026', '15 Oct 2026',
    '[{"id":"i1","name":"Society Maintenance & Security Fee","amount":3200,"category":"maintenance"},{"id":"i2","name":"Sinking & Major Repair Fund","amount":650,"category":"sinking_fund"},{"id":"i3","name":"Water & Common Utility Charges","amount":450,"category":"water"},{"id":"i4","name":"Covered Ground Parking (P-42)","amount":500,"category":"parking"},{"id":"i5","name":"Annual Municipal Property Tax (Pro-rata)","amount":1400,"category":"property_tax"}]'::jsonb,
    6200, 'pending', null, null, null, true, 1400
  ),
  (
    'bill-2026-10-b204', 'flat-b204', 'B-204', 'October 2026', '01 Oct 2026', '15 Oct 2026',
    '[{"id":"i1","name":"Society Maintenance & Security Fee","amount":2600,"category":"maintenance"},{"id":"i2","name":"Sinking & Major Repair Fund","amount":500,"category":"sinking_fund"},{"id":"i3","name":"Water & Common Utility Charges","amount":400,"category":"water"},{"id":"i4","name":"Basement 2 Parking (P-49)","amount":400,"category":"parking"},{"id":"i5","name":"Annual Municipal Property Tax (Pro-rata)","amount":900,"category":"property_tax"}]'::jsonb,
    4800, 'pending', null, null, null, true, 900
  ),
  (
    'bill-2026-10-c303', 'flat-c303', 'C-303', 'October 2026', '01 Oct 2026', '15 Oct 2026',
    '[{"id":"i1","name":"Society Maintenance & Security Fee","amount":4200,"category":"maintenance"},{"id":"i2","name":"Sinking & Major Repair Fund","amount":800,"category":"sinking_fund"},{"id":"i3","name":"Water & Common Utility Charges","amount":550,"category":"water"},{"id":"i4","name":"Basement 2 Parking (P-70)","amount":400,"category":"parking"},{"id":"i5","name":"Annual Municipal Property Tax (Pro-rata)","amount":2000,"category":"property_tax"}]'::jsonb,
    7950, 'pending', null, null, null, true, 2000
  ),
  (
    'bill-2026-10-c102', 'flat-c102', 'C-102', 'October 2026', '01 Oct 2026', '15 Oct 2026',
    '[{"id":"i1","name":"Society Maintenance & Security Fee","amount":3200,"category":"maintenance"},{"id":"i2","name":"Sinking & Major Repair Fund","amount":650,"category":"sinking_fund"},{"id":"i3","name":"Water & Common Utility Charges","amount":450,"category":"water"},{"id":"i4","name":"Basement 1 Parking (P-58)","amount":450,"category":"parking"},{"id":"i5","name":"Annual Municipal Property Tax (Pro-rata)","amount":1400,"category":"property_tax"}]'::jsonb,
    6150, 'pending', null, null, null, true, 1400
  );


-- ------------------------------------------------------------------------------
-- STEP 8: Reseed Document Requests (Pending, Unavailable with 30-Day Note, Fulfilled)
-- ------------------------------------------------------------------------------

INSERT INTO public.document_requests (
  id, flat_id, flat_number, resident_name, delivery_email, document_type, document_name, copy_type, status, requested_at, fulfilled_at, fulfilled_file_name, note, not_available_reason
) VALUES
  (
    'req-1', 'flat-a101', 'A-101', 'Pooja Sharma', 'pooja.sharma@outlook.com',
    'noc_sale_rent', 'NOC for Bank Loan / Mortgage Refinance', 'digital',
    'pending', '10 Oct 2026, 11:30 AM', null, null,
    'Submitted to SBI Home Loans for interest rate re-assessment', null
  ),
  (
    'req-2', 'flat-b402', 'B-402', 'Rajesh Shetty', 'rajesh.shetty@emeraldheights.org',
    'share_certificate', 'Society Share Certificate Duplicate Copy', 'physical',
    'unavailable', '12 Oct 2026, 02:45 PM', null, null,
    'Required for property re-assessment and family succession ledger',
    'This physical document is currently unavailable and is expected to be ready in approximately 30 days.'
  ),
  (
    'req-3', 'flat-c303', 'C-303', 'Vikram Malhotra', 'vikram.m@investments.in',
    'renovation_permission', 'Renovation & Balcony Enclosure Permission', 'digital',
    'fulfilled', '08 Oct 2026, 03:20 PM', '09 Oct 2026, 05:00 PM', 'Renovation_Permission_C303_Approved.pdf',
    'Interior painting and safety grill replacement', null
  );


-- ------------------------------------------------------------------------------
-- STEP 9: Reseed Facility Bookings (1 Approved Clubhouse, 1 Pending Ground, 1 Party Hall)
-- ------------------------------------------------------------------------------

INSERT INTO public.facility_bookings (
  id, flat_id, flat_number, resident_name, facility, date, time_slot, purpose, status, created_at, approved_at, admin_notes
) VALUES
  (
    'book-1', 'flat-b204', 'B-204', 'Ananya Iyer', 'Clubhouse', '2026-10-25',
    'Evening (04:00 PM - 09:00 PM)', 'Family Birthday Celebration & Dinner', 'approved',
    '12 Oct 2026, 11:30 AM', '13 Oct 2026, 05:00 PM', 'Approved. Deposit ₹2,000 received by Treasurer.'
  ),
  (
    'book-2', 'flat-a101', 'A-101', 'Pooja Sharma', 'Society Ground', '2026-11-01',
    'Morning (09:00 AM - 01:00 PM)', 'Wing A Youth Friendly Badminton Tournament', 'pending',
    '14 Oct 2026, 02:15 PM', null, null
  ),
  (
    'book-3', 'flat-c303', 'C-303', 'Vikram Malhotra', 'Party Hall', '2026-11-08',
    'Full Day (09:00 AM - 10:00 PM)', 'Diwali Family Gathering & Pooja', 'approved',
    '10 Oct 2026, 09:40 AM', '11 Oct 2026, 03:00 PM', 'Approved. Music volume to adhere to quiet hours after 10 PM.'
  );


-- ------------------------------------------------------------------------------
-- STEP 10: Reseed Complaints & Tickets
-- ------------------------------------------------------------------------------

INSERT INTO public.complaints (
  id, flat_id, flat_number, resident_name, category, category_label, description, status, created_at, updated_at, admin_response
) VALUES
  (
    'comp-1', 'flat-a101', 'A-101', 'Pooja Sharma', 'water_supply', 'Water Supply',
    'Low water pressure in master bathroom flush line since Sunday morning.', 'in_progress',
    '13 Oct 2026, 08:30 AM', '13 Oct 2026, 02:00 PM', 'Society plumber Mr. Ramu assigned. Inspection scheduled for today 3:00 PM.'
  ),
  (
    'comp-2', 'flat-c303', 'C-303', 'Vikram Malhotra', 'lift_electrical', 'Lift / Electrical',
    'Building C lift sensor door occasionally gets stuck on Floor 3.', 'pending',
    '14 Oct 2026, 09:20 AM', null, null
  ),
  (
    'comp-3', 'flat-b204', 'B-204', 'Ananya Iyer', 'cleanliness', 'Cleanliness & Sanitation',
    'Garbage chute door on 2nd floor Building B requires latch repair and sanitization.', 'resolved',
    '09 Oct 2026, 04:00 PM', '11 Oct 2026, 11:30 AM', 'Latch repaired and chute pressure-cleaned by housekeeping vendor.'
  );


-- ------------------------------------------------------------------------------
-- STEP 11: Reseed Model Documents & Society Rules
-- ------------------------------------------------------------------------------

INSERT INTO public.documents (
  id, flat_id, title, category, file_url, file_size, file_type, uploaded_at, uploaded_by, is_society_wide
) VALUES
  ('doc-1', 'flat-a101', 'Registered Agreement for Sale & Index II (Flat A-101)', 'agreement', 'https://example.com/docs/sale_deed_a101.pdf', '4.8 MB', 'pdf', '12 Jan 2019', 'Managing Committee', false),
  ('doc-2', 'flat-a101', 'Society Share Certificate (Certificate No. 104)', 'share_certificate', 'https://example.com/docs/share_cert_a101.pdf', '1.6 MB', 'pdf', '05 Mar 2019', 'Secretary (Admin)', false),
  ('doc-3', 'flat-b402', 'Registered Agreement for Sale & Allotment Letter (Flat B-402)', 'agreement', 'https://example.com/docs/sale_deed_b402.pdf', '5.1 MB', 'pdf', '15 Mar 2018', 'Managing Committee', false),
  ('doc-4', 'flat-b204', 'Registered Agreement for Sale & Possession Letter (Flat B-204)', 'agreement', 'https://example.com/docs/sale_deed_b204.pdf', '4.2 MB', 'pdf', '02 Dec 2018', 'Managing Committee', false),
  ('doc-5', 'flat-c303', 'Registered Agreement for Sale & Stamp Duty Receipt (Flat C-303)', 'agreement', 'https://example.com/docs/sale_deed_c303.pdf', '4.9 MB', 'pdf', '05 Nov 2020', 'Managing Committee', false),
  ('doc-6', null, 'Emerald Heights CHS Model Bye-Laws (Maharashtra Co-op Societies Act)', 'byelaws', 'https://example.com/docs/society_byelaws_2023.pdf', '8.4 MB', 'pdf', '01 Jan 2023', 'Managing Committee', true),
  ('doc-7', null, 'Annual Fire Safety & Lift Audit Certificate (Form B 2026)', 'insurance', 'https://example.com/docs/fire_safety_audit_2026.pdf', '2.1 MB', 'pdf', '18 Jun 2026', 'MC Facilities Head', true);

INSERT INTO public.society_rules (
  id, title, description, category, penalty_info, origin_meeting, effective_date, last_updated, version
) VALUES
  ('rule-1', 'Visitor & EV Vehicle Parking Regulations', 'Visitors are permitted to park in designated yellow-bay visitor slots for a maximum of 6 consecutive hours. Overnight visitor parking requires prior security intimation via SMS/app. EV charging at designated slots must be freed within 30 minutes of 100% charge completion.', '₹500 wheel-clamp fee for unauthorized parking in private resident slots.', 'AGM 2024 (Minute 7.2 - 14 Aug 2024)', '01 Sep 2024', '12 Mar 2025', 2),
  ('rule-2', 'Flat Interior Renovation & Drilling Hours', 'Civil work, heavy carpentry, and power drilling are strictly restricted to 10:00 AM – 1:00 PM and 3:00 PM – 6:00 PM on Mondays through Saturdays. No loud work is allowed on Sundays or declared public holidays. Debris must be cleared via service elevator only.', '₹2,000 fine on owner + immediate cessation of contractor entry.', 'EGM on Resident Harmony (18 Nov 2023)', '01 Dec 2023', '01 Dec 2023', 1),
  ('rule-3', 'Pet Care & Leash Mandate in Common Areas', 'All companion dogs must be on a leash when traversing corridors, lobbies, and elevators. Pet owners must utilize Elevator #2 (service lift) during peak morning rush (8:00 AM – 9:30 AM). Owners are legally responsible for scooping waste on society lawns/jogging tracks.', '₹1,000 fine for repeated littering in common areas.', 'AGM 2023 (Minute 4.1 - 20 Aug 2023)', '01 Sep 2023', '15 Apr 2024', 3),
  ('rule-4', 'Quiet Hours & Terrace Party Guidelines', 'Strict quiet hours apply across all wings between 10:30 PM and 7:00 AM. Terrace bookings for private gatherings are allowed up to 10:00 PM with zero amplified sound after 10:00 PM as per municipal noise pollution norms. Max 40 guests allowed per booking.', 'Forfeiture of ₹5,000 security deposit for noise violations after 10:30 PM.', 'EGM (09 Feb 2024)', '01 Mar 2024', '01 Mar 2024', 1),
  ('rule-5', 'Mandatory 3-Way Waste Segregation', 'Household waste must be handed to housekeeping staff strictly segregated into Green (Wet/Biodegradable), Blue (Dry/Recyclable), and Red (Hazardous/Sanitary) bins at doorstep collection between 7:30 AM and 9:00 AM. Unsegregated bags will not be picked up.', '₹250 refusal notice per occurrence.', 'Swachh Society Drive Resolution (10 Jan 2025)', '01 Feb 2025', '01 Feb 2025', 1),
  ('rule-6', 'Clubhouse Gymnasium & Swimming Pool Etiquette', 'Gymnasium is open 6:00 AM – 11:00 AM and 5:00 PM – 10:00 PM. Appropriate sportswear and clean footwear mandatory. Swimming pool requires nylon swimwear and mandatory pre-shower. Children under 12 must be accompanied by an adult.', null, 'AGM 2022 (07 Aug 2022)', '15 Aug 2022', '10 Jun 2025', 2);

-- ==============================================================================
-- END OF RESEED SCRIPT
-- ==============================================================================
