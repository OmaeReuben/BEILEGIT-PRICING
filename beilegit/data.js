/*
  BeiLegit published listings: officially published fixed prices in Kenya.
  Compiled 20 November 2026 from each organisation's own tariff page, the Kenya
  Gazette, or press reports of those notices. Every listing carries its source.

  Prices change. Before relying on a figure, open the source link and re-check.
  Fuel is reviewed by EPRA on the 14th of every month.

  Fields
    official  true = taken from a published tariff (shows "Official rate")
    verified  set to true yourself once you have re-checked the listing
    source    where the price was published
    price     number in KES. 0 is shown as "Free".
*/
(function () {
  // Turns [["101 to 500", 7], ...] into item rows.
  const bands = (label, unit, rows) =>
    rows.map(([range, price]) => ({ name: label + " KES " + range, kind: "service", price, unit }));

  const SEND = [["1 to 100", 0], ["101 to 500", 7], ["501 to 1,000", 13], ["1,001 to 1,500", 23], ["1,501 to 2,500", 33],
    ["2,501 to 3,500", 53], ["3,501 to 5,000", 57], ["5,001 to 7,500", 78], ["7,501 to 10,000", 90],
    ["10,001 to 15,000", 100], ["15,001 to 20,000", 105], ["20,001 to 250,000", 108]];
  const WITHDRAW = [["50 to 100", 11], ["101 to 2,500", 29], ["2,501 to 3,500", 52], ["3,501 to 5,000", 69],
    ["5,001 to 7,500", 87], ["7,501 to 10,000", 115], ["10,001 to 15,000", 167], ["15,001 to 20,000", 185],
    ["20,001 to 35,000", 197], ["35,001 to 50,000", 278], ["50,001 to 250,000", 309]];

  window.BEILEGIT_DATA = [
    {
      id: "safaricom-mpesa", name: "Safaricom M-PESA", category: "Mobile money and airtime", town: "Countrywide",
      about: "Customer charges from Safaricom's published tariff. Sending to Airtel Money or T-Kash costs the same as sending to M-PESA. Deposits are free. You cannot withdraw less than KES 50 at an agent.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.safaricom.co.ke/personal/m-pesa/mpesa-charges",
      items: [
        ...bands("Send", "per transaction", SEND),
        ...bands("Withdraw at agent", "per withdrawal", WITHDRAW),
        ...bands("Withdraw at ATM", "per withdrawal", [["200 to 2,500", 35], ["2,501 to 5,000", 69], ["5,001 to 10,000", 115], ["10,001 to 35,000", 203]])
      ]
    },
    {
      id: "airtel-money", name: "Airtel Money", category: "Mobile money and airtime", town: "Countrywide",
      about: "Charges from Airtel Kenya's published tariff. Airtel to Airtel transfers are free for every amount.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.airtelkenya.com/ke/personal/tariffs-charges",
      items: [
        { name: "Send Airtel to Airtel, any amount", kind: "service", price: 0, unit: "per transaction" },
        ...bands("Send to other networks", "per transaction", SEND.slice(1)),
        ...bands("Withdraw at agent", "per withdrawal", WITHDRAW)
      ]
    },
    {
      id: "safaricom-payg", name: "Safaricom calls and SMS (no bundle)", category: "Mobile money and airtime", town: "Countrywide",
      about: "Pay-as-you-go rates charged when you have no active bundle. Peak is 8am to 10pm. Bundle prices vary by customer offer, so they are not listed.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://safaricom.co.ke/media-center-landing/press-releases/customer-notice-implementation-of-20-excise-duty",
      items: [
        { name: "Voice call, peak", kind: "service", price: 4.87, unit: "per minute" },
        { name: "Voice call, off-peak", kind: "service", price: 2.5, unit: "per minute" },
        { name: "SMS", kind: "service", price: 1.2, unit: "per SMS" }
      ]
    },
    {
      id: "immigration-passports", name: "Directorate of Immigration Services", category: "Government services", town: "Countrywide",
      about: "Paid only on eCitizen. Since February 2026 the 66-page booklet is the only ordinary passport offered to new applicants. Official pages differ by up to KES 500 on this fee, so the eCitizen invoice is final. Nobody should ask you for cash.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://immigration.go.ke/type-and-fees/",
      items: [
        { name: "Ordinary passport, 66 pages", kind: "service", price: 12500, unit: "per passport" },
        { name: "Diplomatic passport", kind: "service", price: 15000, unit: "per passport" },
        { name: "Replace a lost or mutilated passport", kind: "service", price: 20000, unit: "per passport" },
        { name: "Temporary permit", kind: "service", price: 1050, unit: "per permit" }
      ]
    },
    {
      id: "nrb-id", name: "National Registration Bureau (ID cards)", category: "Government services", town: "Countrywide",
      about: "A first ID is free. The KES 1,000 replacement fee was waived until 30 October 2026. Check whether the waiver has been extended before paying.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.the-star.co.ke/news/2026-05-02-state-extends-id-fee-waiver-by-6-months",
      items: [
        { name: "First national ID card", kind: "service", price: 0, unit: "per card" },
        { name: "Replace a lost ID or change details", kind: "service", price: 1000, unit: "per card" }
      ]
    },
    {
      id: "civil-registration", name: "Civil Registration Services", category: "Government services", town: "Countrywide",
      about: "Birth certificate fees as confirmed by Huduma Kenya in 2026.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.kenyans.co.ke/news/124883-birth-certificate-fees-still-apply-despite-government-waiver-plan-huduma-kenya-confirms",
      items: [
        { name: "New birth certificate", kind: "service", price: 250, unit: "per certificate" },
        { name: "Late registration of a birth", kind: "service", price: 500, unit: "per registration" },
        { name: "Correction on a birth certificate", kind: "service", price: 1000, unit: "per correction" }
      ]
    },
    {
      id: "dci-clearance", name: "DCI Police Clearance", category: "Government services", town: "Countrywide",
      about: "The Certificate of Good Conduct. Paid on eCitizen: KES 1,000 plus the KES 50 eCitizen fee. Fingerprinting is included.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://nation.africa/kenya/news/certificate-of-good-conduct-goes-digital-to-be-issued-in-24hrs-5535392",
      items: [{ name: "Police clearance certificate (good conduct)", kind: "service", price: 1050, unit: "per certificate" }]
    },
    {
      id: "ntsa", name: "NTSA", category: "Government services", town: "Countrywide", phone: "0709 932 000",
      about: "Smart driving licence, new or renewal, paid on eCitizen. Vehicle transfer fees depend on engine size and are shown on your eCitizen invoice.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://hudumakenya.go.ke/lifeEvent/ServiceDetails/69",
      items: [{ name: "Smart driving licence, 3 years", kind: "service", price: 3050, unit: "per licence" }]
    },
    {
      id: "brs", name: "Business Registration Service", category: "Government services", town: "Countrywide",
      about: "Companies Registry fees, paid on eCitizen.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://brs.go.ke/miscellaneous-fees/",
      items: [
        { name: "Business name registration", kind: "service", price: 950, unit: "per registration" },
        { name: "Private limited company registration", kind: "service", price: 10650, unit: "per company" },
        { name: "Limited liability partnership registration", kind: "service", price: 25000, unit: "per LLP" },
        { name: "CR12 company search", kind: "service", price: 650, unit: "per search" }
      ]
    },
    {
      id: "sha-cover", name: "Social Health Authority (SHA): contributions and cover", category: "Health insurance", town: "Countrywide", phone: "0800 720 601",
      about: "Contributions are 2.75% of gross income with a KES 300 monthly minimum. Registered members deliver free at Level 2 and Level 3 facilities (dispensaries and health centres).",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://sha.go.ke",
      items: [
        { name: "Minimum SHA contribution", kind: "service", price: 300, unit: "per month" },
        { name: "Maternity at Level 2 and 3 facilities, registered members", kind: "service", price: 0, unit: "per delivery" }
      ]
    },
    {
      id: "sha-hospital", name: "SHA tariffs: hospital services", category: "Hospital and clinic services", town: "Countrywide", phone: "0800 720 601",
      about: "What SHA pays the hospital for a covered member. A facility should not bill you this amount again. If a hospital quotes far more for the same service, ask what the extra covers.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.mtrh.go.ke/wp-content/uploads/download-manager-files/SHA-INFORMATION-PACKAGE-FOR-STAFF.pdf",
      items: [
        { name: "Normal delivery and newborn care", kind: "service", price: 10000, unit: "per delivery" },
        { name: "Caesarean section and newborn care", kind: "service", price: 30000, unit: "per delivery" },
        { name: "Inpatient stay, Level 3 hospital", kind: "service", price: 2240, unit: "per day" },
        { name: "Inpatient stay, Level 4 hospital", kind: "service", price: 3360, unit: "per day" },
        { name: "Inpatient stay, Level 5 hospital", kind: "service", price: 3920, unit: "per day" },
        { name: "Inpatient stay, Level 6 hospital", kind: "service", price: 4480, unit: "per day" },
        { name: "Intensive care (ICU)", kind: "service", price: 28000, unit: "per day" },
        { name: "Haemodialysis", kind: "service", price: 10650, unit: "per session" },
        { name: "Peritoneal dialysis", kind: "service", price: 85200, unit: "per month" },
        { name: "Eyeglasses dispensed", kind: "product", price: 950, unit: "per pair" },
        { name: "Mortuary storage", kind: "service", price: 500, unit: "per day" }
      ]
    },
    {
      id: "sha-tests", name: "SHA tariffs: scans and laboratory tests", category: "Laboratory tests and scans", town: "Countrywide", phone: "0800 720 601",
      about: "What SHA pays the facility for a covered member. The yearly laboratory packages apply once per person per year at Level 4 to 6 hospitals.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.mtrh.go.ke/wp-content/uploads/download-manager-files/SHA-INFORMATION-PACKAGE-FOR-STAFF.pdf",
      items: [
        { name: "MRI scan", kind: "service", price: 11000, unit: "per scan" },
        { name: "CT scan", kind: "service", price: 6900, unit: "per scan" },
        { name: "CT angiogram", kind: "service", price: 8000, unit: "per scan" },
        { name: "Mammogram", kind: "service", price: 3000, unit: "per scan" },
        { name: "Diabetes laboratory tests", kind: "service", price: 4300, unit: "per year" },
        { name: "Heart disease laboratory tests", kind: "service", price: 2850, unit: "per year" },
        { name: "Sickle cell laboratory tests", kind: "service", price: 6800, unit: "per year" },
        { name: "Asthma and COPD tests", kind: "service", price: 700, unit: "per year" }
      ]
    },
    {
      id: "epra-fuel", name: "EPRA fuel pump prices", category: "Fuel and energy", town: "Nairobi",
      about: "Maximum legal pump prices for 15 November to 14 December 2026. A station may charge less, never more. Other towns have their own caps: super petrol is KES 223.81 in Mombasa, 225.73 in Nakuru and 226.51 in Eldoret.",
      official: true, verified: false, updatedAt: "2026-11-14",
      source: "https://www.epra.go.ke",
      items: [
        { name: "Super petrol", kind: "product", price: 226.96, unit: "per litre" },
        { name: "Diesel", kind: "product", price: 227.76, unit: "per litre" },
        { name: "Kerosene", kind: "product", price: 219.87, unit: "per litre" }
      ]
    },
    {
      id: "kenya-power", name: "Kenya Power (domestic)", category: "Fuel and energy", town: "Countrywide",
      about: "Base energy rates only. Your bill or token also carries fuel, forex and other monthly charges set by EPRA, plus taxes.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.epra.go.ke",
      items: [
        { name: "Domestic 1: up to 30 units a month", kind: "product", price: 12.14, unit: "per unit (kWh)" },
        { name: "Domestic 3: over 100 units a month", kind: "product", price: 18.57, unit: "per unit (kWh)" }
      ]
    },
    {
      id: "madaraka-express", name: "Kenya Railways: Madaraka Express (SGR)", category: "Transport", town: "Nairobi",
      about: "One-way adult fares from Nairobi Terminus. Children under 3 travel free and ages 3 to 11 pay half. Book on metickets.krc.co.ke or *639#. Tickets are never sold by brokers.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://metickets.krc.co.ke",
      items: [
        { name: "Nairobi to Mombasa, economy", kind: "service", price: 1500, unit: "per seat" },
        { name: "Nairobi to Mombasa, first class", kind: "service", price: 4500, unit: "per seat" },
        { name: "Nairobi to Mombasa, premium", kind: "service", price: 12000, unit: "per seat" },
        { name: "Nairobi to Mombasa, premium return", kind: "service", price: 20000, unit: "per seat" },
        { name: "Nairobi to Athi River, economy", kind: "service", price: 90, unit: "per seat" },
        { name: "Nairobi to Emali, economy", kind: "service", price: 390, unit: "per seat" },
        { name: "Nairobi to Kibwezi, economy", kind: "service", price: 600, unit: "per seat" },
        { name: "Nairobi to Mtito Andei, economy", kind: "service", price: 740, unit: "per seat" },
        { name: "Nairobi to Voi, economy", kind: "service", price: 1050, unit: "per seat" },
        { name: "Nairobi to Miasenyi, economy", kind: "service", price: 1350, unit: "per seat" },
        { name: "Nairobi to Mariakani, economy", kind: "service", price: 1410, unit: "per seat" }
      ]
    },
    {
      id: "nyahururu-train", name: "Kenya Railways: Nyahururu Safari Train", category: "Transport", town: "Nairobi",
      about: "Economy fares announced in June 2026. Kenya Railways made temporary route changes from 12 November 2026, so confirm the day's service before travelling.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://krc.co.ke",
      items: [
        { name: "Nairobi to Gilgil, economy", kind: "service", price: 450, unit: "per seat" },
        { name: "Nairobi to Ol Kalou, economy", kind: "service", price: 550, unit: "per seat" },
        { name: "Nairobi to Nyahururu, economy", kind: "service", price: 600, unit: "per seat" }
      ]
    },
    {
      id: "nairobi-expressway", name: "Nairobi Expressway", category: "Transport", town: "Nairobi",
      about: "Gazetted tolls for a saloon car, before VAT. The toll depends on where you enter and exit. Larger vehicles pay a multiple.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://nairobiexpressway.ke",
      items: [
        { name: "Shortest trip, saloon car", kind: "service", price: 170, unit: "per trip" },
        { name: "Westlands to Mlolongo, saloon car", kind: "service", price: 500, unit: "per trip" }
      ]
    },
    {
      id: "kws-parks", name: "Kenya Wildlife Service", category: "Tourism and parks", town: "Countrywide",
      about: "Daily entry for Kenyan and East African citizens. Residents and non-residents pay different rates. Paid through KWSpay on eCitizen, not in cash at the gate.",
      official: true, verified: false, updatedAt: "2026-11-20",
      source: "https://www.kws.go.ke/sites/default/files/2025-09/KWS%20Conservation%20Fee%20October%20%202025.pdf",
      items: [
        { name: "Nairobi National Park, adult", kind: "service", price: 1000, unit: "per day" },
        { name: "Nairobi National Park, child or student", kind: "service", price: 500, unit: "per day" },
        { name: "Nairobi package (park, orphanage, safari walk), adult", kind: "service", price: 1300, unit: "per day" },
        { name: "Amboseli or Lake Nakuru, adult", kind: "service", price: 1500, unit: "per day" },
        { name: "Amboseli or Lake Nakuru, child or student", kind: "service", price: 750, unit: "per day" },
        { name: "Tsavo East or Tsavo West, adult", kind: "service", price: 1000, unit: "per day" },
        { name: "Tsavo East or Tsavo West, child or student", kind: "service", price: 500, unit: "per day" }
      ]
    }
  ];
})();
