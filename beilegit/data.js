/*
  BeiLegit published listings.
  This file is the public price board. Every visitor sees what is listed here.
  To publish a new organisation: add it below (or replace this file with the one
  downloaded from the "For organisations" page) and commit to GitHub.

  Fields
    id        unique text, no spaces
    verified  true once you have confirmed the organisation is genuine
    sample    true for example data (shows an "Example" label). Remove for real listings.
    items     kind is "service" or "product"; price is a number in KES
*/
window.BEILEGIT_DATA = [
  {
    id: "zuri-kinyozi", name: "Zuri Kinyozi & Salon", category: "Beauty and grooming",
    town: "Umoja, Nairobi", phone: "0700 000 101", about: "Barber and salon open every day, 8am to 9pm.",
    verified: true, sample: true, updatedAt: "2026-11-18",
    items: [
      { name: "Men's haircut", kind: "service", price: 200, unit: "per cut" },
      { name: "Haircut and beard trim", kind: "service", price: 300, unit: "per visit" },
      { name: "Braiding (medium knotless)", kind: "service", price: 1800, unit: "per head" },
      { name: "Manicure", kind: "service", price: 500, unit: "per session" }
    ]
  },
  {
    id: "baraka-cyber", name: "Baraka Cyber & Print", category: "Printing and cyber",
    town: "Nakuru", phone: "0700 000 102", about: "Printing, scanning and online applications.",
    verified: true, sample: true, updatedAt: "2026-11-15",
    items: [
      { name: "Black and white printing", kind: "service", price: 10, unit: "per page" },
      { name: "Colour printing", kind: "service", price: 30, unit: "per page" },
      { name: "Passport photos (4 copies)", kind: "service", price: 150, unit: "per set" },
      { name: "Online form filling help", kind: "service", price: 100, unit: "per application" }
    ]
  },
  {
    id: "fundi-fix", name: "Fundi Fix Phone Repairs", category: "Repairs and tech",
    town: "Mombasa", phone: "0700 000 103", about: "Phone and laptop repairs with a 30 day guarantee.",
    verified: false, sample: true, updatedAt: "2026-11-10",
    items: [
      { name: "Screen protector fitted", kind: "product", price: 250, unit: "each" },
      { name: "Charging port repair", kind: "service", price: 800, unit: "per phone" },
      { name: "Laptop cleaning and thermal paste", kind: "service", price: 1500, unit: "per laptop" },
      { name: "Windows installation", kind: "service", price: 1000, unit: "per computer" }
    ]
  },
  {
    id: "tumaini-clinic", name: "Tumaini Medical Clinic", category: "Health",
    town: "Kisumu", phone: "0700 000 104", about: "Outpatient clinic and laboratory.",
    verified: true, sample: true, updatedAt: "2026-11-19",
    items: [
      { name: "Doctor consultation", kind: "service", price: 500, unit: "per visit" },
      { name: "Malaria test", kind: "service", price: 200, unit: "per test" },
      { name: "Blood sugar test", kind: "service", price: 150, unit: "per test" },
      { name: "Wound dressing", kind: "service", price: 300, unit: "per visit" }
    ]
  },
  {
    id: "upendo-driving", name: "Upendo Driving School", category: "Education",
    town: "Eldoret", phone: "0700 000 105", about: "Driving lessons for class B and motorcycle riders.",
    verified: false, sample: true, updatedAt: "2026-11-05",
    items: [
      { name: "Class B full course", kind: "service", price: 15000, unit: "per course" },
      { name: "Motorcycle course", kind: "service", price: 8000, unit: "per course" },
      { name: "Refresher lesson", kind: "service", price: 1000, unit: "per hour" }
    ]
  },
  {
    id: "safari-shuttle", name: "Safari Shuttle", category: "Transport",
    town: "Nairobi", phone: "0700 000 106", about: "Daily shuttle services from Nairobi CBD.",
    verified: true, sample: true, updatedAt: "2026-11-17",
    items: [
      { name: "Nairobi to Nakuru", kind: "service", price: 600, unit: "per seat" },
      { name: "Nairobi to Kisumu", kind: "service", price: 1600, unit: "per seat" },
      { name: "Nairobi to Mombasa", kind: "service", price: 1800, unit: "per seat" },
      { name: "Parcel up to 5 kg", kind: "service", price: 300, unit: "per parcel" }
    ]
  }
];
