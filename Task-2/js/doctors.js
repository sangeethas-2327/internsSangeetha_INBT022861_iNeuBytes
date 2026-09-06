/**
 * CareNova Health — Task 2: Doctor Dataset & Metadata Module
 * Fictional Demonstration Dataset for iNeuBytes Web Development Internship
 */

const departmentsData = [
  { id: "all", name: "All Departments", icon: "🏥" },
  { id: "cardiology", name: "Cardiology", icon: "🫀" },
  { id: "neurology", name: "Neurology", icon: "🧠" },
  { id: "pediatrics", name: "Pediatrics", icon: "👶" },
  { id: "orthopedics", name: "Orthopedics", icon: "🦴" },
  { id: "dermatology", name: "Dermatology", icon: "🧴" },
  { id: "general", name: "General Medicine", icon: "🩺" }
];

const doctorsData = [
  {
    id: "doc-101",
    name: "Dr. Sarah Jenkins",
    qualification: "MD, FACC (Cardiology)",
    department: "cardiology",
    departmentName: "Cardiology",
    experienceYears: 12,
    fee: 800, // Consultation fee in INR (Demo)
    rating: 4.9,
    reviewsCount: 48,
    availableDays: ["Mon", "Tue", "Wed", "Thu"],
    timeSlots: ["09:00 AM", "10:30 AM", "02:00 PM", "04:30 PM"],
    avatarText: "SJ",
    bio: "Senior Consultant Cardiologist specializing in preventive heart care, ECG screening, and non-invasive cardiac diagnostic evaluations."
  },
  {
    id: "doc-102",
    name: "Dr. Marcus Vance",
    qualification: "DM, Neuro (Neurology)",
    department: "neurology",
    departmentName: "Neurology",
    experienceYears: 10,
    fee: 900,
    rating: 4.8,
    reviewsCount: 36,
    availableDays: ["Tue", "Wed", "Fri", "Sat"],
    timeSlots: ["10:00 AM", "11:30 AM", "03:00 PM", "05:00 PM"],
    avatarText: "MV",
    bio: "Neurological specialist with expertise in headache management, nerve health assessment, and clinical neuro-wellness."
  },
  {
    id: "doc-103",
    name: "Dr. Elena Rostova",
    qualification: "MD, DCH (Pediatrics)",
    department: "pediatrics",
    departmentName: "Pediatrics",
    experienceYears: 8,
    fee: 650,
    rating: 4.9,
    reviewsCount: 52,
    availableDays: ["Mon", "Wed", "Thu", "Fri", "Sat"],
    timeSlots: ["09:30 AM", "11:00 AM", "02:30 PM", "04:00 PM"],
    avatarText: "ER",
    bio: "Pediatrician dedicated to compassionate child healthcare, growth monitoring, pediatric immunizations, and adolescent wellness."
  },
  {
    id: "doc-104",
    name: "Dr. David Chen",
    qualification: "MS, Ortho (Orthopedics)",
    department: "orthopedics",
    departmentName: "Orthopedics",
    experienceYears: 11,
    fee: 750,
    rating: 4.7,
    reviewsCount: 41,
    availableDays: ["Mon", "Tue", "Thu", "Sat"],
    timeSlots: ["10:00 AM", "01:00 PM", "03:30 PM", "05:30 PM"],
    avatarText: "DC",
    bio: "Orthopedic surgeon specializing in joint mobility, sports injuries, fracture rehabilitation, and musculoskeletal consultations."
  },
  {
    id: "doc-105",
    name: "Dr. Priya Nair",
    qualification: "MD, DVL (Dermatology)",
    department: "dermatology",
    departmentName: "Dermatology",
    experienceYears: 7,
    fee: 700,
    rating: 4.8,
    reviewsCount: 29,
    availableDays: ["Tue", "Wed", "Thu", "Fri"],
    timeSlots: ["11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"],
    avatarText: "PN",
    bio: "Dermatologist providing comprehensive skin health consultations, allergy evaluations, and preventive dermatological care."
  },
  {
    id: "doc-106",
    name: "Dr. Rajesh Sharma",
    qualification: "MD (General Medicine)",
    department: "general",
    departmentName: "General Medicine",
    experienceYears: 14,
    fee: 500,
    rating: 4.9,
    reviewsCount: 64,
    availableDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    timeSlots: ["08:30 AM", "10:30 AM", "01:30 PM", "05:00 PM"],
    avatarText: "RS",
    bio: "Senior General Physician specializing in primary care, chronic lifestyle condition management, and routine health checkups."
  }
];

// Helper Query Functions
function getDoctorById(id) {
  return doctorsData.find(doc => doc.id === id) || null;
}

function searchDoctors(query = "", departmentId = "all") {
  const cleanQuery = query.toLowerCase().trim();
  
  return doctorsData.filter(doc => {
    // 1. Department Filter Check
    const matchesDept = (departmentId === "all" || doc.department === departmentId);
    
    // 2. Keyword Search Check
    const matchesQuery = !cleanQuery || 
      doc.name.toLowerCase().includes(cleanQuery) ||
      doc.departmentName.toLowerCase().includes(cleanQuery) ||
      doc.qualification.toLowerCase().includes(cleanQuery) ||
      doc.bio.toLowerCase().includes(cleanQuery);
      
    return matchesDept && matchesQuery;
  });
}
