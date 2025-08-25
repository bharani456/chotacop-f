// import React, { useState, useRef } from "react";
// import Header from "../components/Header";
// import ImageUploader from "../components/Image_Uploader";
// import html2canvas from "html2canvas";
// import { jsPDF } from "jspdf";
// import Ex_Zone from "../components/Ex_Zone";
// import axios from "axios";
// import Popup from "../components/Popup";
// import ReCAPTCHA from "react-google-recaptcha";

// /**
//  * SITE KEY HANDLING
//  * - Put your real key in .env as: VITE_RECAPTCHA_SITE_KEY=your_key_here
//  * - For local dev (localhost), we fallback to Google's public test key to avoid crashes.
//  */
// const GOOGLE_TEST_V2_SITE_KEY = "6LehoagrAAAAAAfoIaDMGJJI8LkRGqaewejitNFG";
// const ENV_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// const SITE_KEY =
//   ENV_SITE_KEY ||
//   (typeof window !== "undefined" && window.location.hostname === "localhost"
//     ? GOOGLE_TEST_V2_SITE_KEY
//     : "");

// // ------------------------ your existing constants ------------------------
// const questions = [
//   "Were you riding with a parent?",
//   "If on a bike or scooter, did everyone wear a helmet?",
//   "If in a car, did everyone wear a seatbelt?",
//   "Did the driver honk too much?",
//   "Did the driver follow traffic lights?",
//   "At a red light, did the driver stop at the white line?",
//   "Did the driver use a phone while driving?",
//   "Did the driver keep changing lanes?",
//   "Did the driver go into a \"No Entry\" road?",
//   "Did the driver stop for people walking (pedestrians)?",
//   "If in an auto, were too many people sitting inside?",
//   "If on a two-wheeler, were three people riding on it?",
//   "Did your driver have a license and insurance?",
// ];

// const TOTAL_RIDES = 7;
// const experienceQuestionsCount = 4;
// const parentQuestionsCount = 2;
// const FIVE_MB = 5 * 1024 * 1024;

// const QuestionTogglePage = () => {
//   // ------------------------ your existing state ------------------------
//   const [ridesAnswers, setRidesAnswers] = useState(
//     Array(TOTAL_RIDES)
//       .fill(null)
//       .map(() => Array(questions.length).fill(false))
//   );
//   const [submittedRides, setSubmittedRides] = useState(
//     Array(TOTAL_RIDES).fill(false)
//   );
//   const [studentInfo, setStudentInfo] = useState({
//     name: "",
//     class: "",
//     chapter: "",
//     school: "",
//     email: "",
//   });
//   const [experienceAnswers, setExperienceAnswers] = useState(
//     Array(experienceQuestionsCount).fill(false)
//   );
//   const [parentZoneAnswers, setParentZoneAnswers] = useState(
//     Array(parentQuestionsCount).fill(false)
//   );
//   const [checkingEmail, setCheckingEmail] = useState(false);
//   const [rideActive, setRideActive] = useState(Array(TOTAL_RIDES).fill(false));
//   const [submitted, setSubmitted] = useState(false);
//   const [popupOpen, setPopupOpen] = useState(false);
//   const [popupMessage, setPopupMessage] = useState("");
//   const [showCertTooltip, setShowCertTooltip] = useState(false);

//   // ------------------------ captcha state ------------------------
//   const [showCaptcha, setShowCaptcha] = useState(false);
//   const recaptchaRef = useRef(null);

//   const handleToggle = (rideIdx, questionIdx) => {
//     if (!isStudentInfoComplete) {
//       setPopupMessage(
//         "Please fill in all student information before answering."
//       );
//       setPopupOpen(true);
//       return;
//     }
//     if (!rideActive[rideIdx]) {
//       setPopupMessage(
//         "Activate this ride by checking the box before answering."
//       );
//       setPopupOpen(true);
//       return;
//     }
//     if (submittedRides[rideIdx]) return;
//     const updatedAnswers = [...ridesAnswers];
//     updatedAnswers[rideIdx][questionIdx] = !updatedAnswers[rideIdx][questionIdx];
//     setRidesAnswers(updatedAnswers);
//   };

//   const handleRideCheckbox = (idx) => {
//     setRideActive((prev) => {
//       if (!prev[idx]) {
//         if (idx === 0 || prev[idx - 1]) {
//           return prev.map((v, i) => (i === idx ? true : v));
//         } else {
//           setPopupMessage(
//             `Please activate Ride ${idx} before activating Ride ${idx + 1}.`
//           );
//           setPopupOpen(true);
//           return prev;
//         }
//       } else {
//         const anyLaterChecked = prev.slice(idx + 1).some(Boolean);
//         if (anyLaterChecked) {
//           setPopupMessage(
//             `Please deactivate all rides after Ride ${idx + 1} first.`
//           );
//           setPopupOpen(true);
//           return prev;
//         } else {
//           return prev.map((v, i) => (i === idx ? false : v));
//         }
//       }
//     });
//   };

//   const handleInputChange = (e) => {
//     setStudentInfo({
//       ...studentInfo,
//       [e.target.name]: e.target.value,
//     });
//   };

//   // ------------------------ EMAIL CHECK: split into 2 steps ------------------------
//   const handleCheckEmail = () => {
//     const email = studentInfo.email.trim();
//     if (!email) {
//       alert("Please enter an email.");
//       return;
//     }
//     if (!SITE_KEY) {
//       setPopupMessage(
//         "reCAPTCHA site key is missing. Add VITE_RECAPTCHA_SITE_KEY to your .env or use the Google test key on localhost."
//       );
//       setPopupOpen(true);
//       return;
//     }
//     setShowCaptcha(true);
//   };

//   const handleCaptchaComplete = async (token) => {
//     if (!token) return;
//     setCheckingEmail(true);
//     try {
//       await axios.post(
//         "https://chotacop.in/api/contact",
//         {
//           recaptchaToken: token,
//           email: studentInfo.email || "",
//         },
//         { headers: { "Content-Type": "application/json" } }
//       );
//       await runEmailCheck();
//     } catch (e) {
//       console.error("reCAPTCHA verification or email check failed:", e);
//       alert("reCAPTCHA verification failed. Please try again.");
//     } finally {
//       recaptchaRef.current?.reset?.();
//       setShowCaptcha(false);
//       setCheckingEmail(false);
//     }
//   };

//   const handleCaptchaExpired = () => {
//     recaptchaRef.current?.reset?.();
//   };

//   const handleCaptchaErrored = () => {
//     console.error("reCAPTCHA failed to load or encountered an error.");
//     setPopupMessage(
//       "reCAPTCHA failed to load. Please refresh the page or try again later."
//     );
//     setPopupOpen(true);
//   };

//   const runEmailCheck = async () => {
//     const email = studentInfo.email.trim();
//     const res = await axios.post(
//       "https://chotacop.in/api/check-mail",
//       { email },
//       {
//         headers: { "Content-Type": "application/json" },
//       }
//     );

//     if (res.data.exists) {
//       const dataRes = await axios.post(
//         "https://chotacop.in/api/email-data",
//         { email },
//         {
//           headers: { "Content-Type": "application/json" },
//         }
//       );
//       const info = dataRes.data.data && dataRes.data.data[0];

//       if (info) {
//         setStudentInfo((prev) => ({
//           ...prev,
//           name: info.name || prev.name,
//           class: info.class || info.class_ || prev.class,
//           chapter: info.chapter || prev.chapter,
//           school: info.school || prev.school,
//           email: email,
//         }));

//         if (info.q1) {
//           const newRidesAnswers = Array(TOTAL_RIDES)
//             .fill(null)
//             .map(() => Array(questions.length).fill(false));
//           for (let q = 0; q < questions.length; q++) {
//             const arr = info[`q${q + 1}`];
//             if (Array.isArray(arr)) {
//               for (let rideIdx = 0; rideIdx < arr.length; rideIdx++) {
//                 newRidesAnswers[rideIdx][q] = arr[rideIdx] === 1;
//               }
//             }
//           }
//           setRidesAnswers(newRidesAnswers);
//         }

//         setExperienceAnswers([
//           info.c1 === 1,
//           info.c2 === 1,
//           info.c3 === 1,
//           info.c4 === 1,
//         ]);

//         setParentZoneAnswers([info.c5 === 1, false]);

//         setPopupMessage(`Welcome back, ${info.name || "User"}!`);
//         setPopupOpen(true);
//       } else {
//         setPopupMessage("Welcome back!");
//         setPopupOpen(true);
//       }
//     } else {
//       setPopupMessage("Welcome to chotacop!");
//       setPopupOpen(true);
//     }
//   };
//   // ------------------------ end email check flow ------------------------

//   const handleDownloadReportCard = () => {
//     const link = document.createElement("a");
//     link.href = "/assets/Final Card.pdf";
//     link.download = "ChotaCop_ReportCard.pdf";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   // ========================= CERTIFICATE: SMALLER PDF + EMAIL =========================
//   // Helper: create the DOM to render the certificate
//   const buildCertificateDOM = () => {
//     const { name, school, class: studentClass, chapter } = studentInfo;
//     const tempDiv = document.createElement("div");
//     tempDiv.className =
//       "relative w-[1123px] h-[794px] bg-white shadow-lg border rounded-lg overflow-hidden";
//     tempDiv.style.width = "1123px";
//     tempDiv.style.height = "794px";
//     tempDiv.innerHTML = `
//       <link href="https://fonts.googleapis.com/css2?family=Shrikhand&display=swap" rel="stylesheet">
//       <style>
//         @import url('https://fonts.googleapis.com/css2?family=Shrikhand&display=swap');
//         .shrikhand { font-family: 'Shrikhand', cursive; }
//         .canvas-sans { font-family: 'Arial', 'Helvetica Neue', Helvetica, 'Canvas Sans', sans-serif; }
//       </style>
//       <img src="/assets/Certificate Blank.png" 
//            alt="Certificate" 
//            style="width: 1123px; height: 794px; object-fit: cover; position: absolute; left: 0; top: 0;"/>
//       <div class="canvas-sans" style="position: absolute; top: 246px; left: 90px; font-size: 50px; font-weight: bold; color: #F7931E;">
//         Congratulations!
//       </div>
//       <div class="canvas-sans" style="position: absolute; top: 320px; left: 90px; font-size: 24px; color: #888;">
//         This is to certify
//       </div>
//       <div class="shrikhand" style="position: absolute; top: 344px; left: 90px; font-size: 40px; color: #2d1a4a;">
//         ${name}
//       </div>
//       <div class="canvas-sans" style="position: absolute; top: 410px; left: 90px; font-size: 24px; color: #888;">
//         of ${school}
//       </div>
//       <div class="canvas-sans" style="position: absolute; top: 440px; left: 90px; font-size: 24px; color: #888;">
//         in class ${studentClass} at ${chapter}
//       </div>
//       <div class="canvas-sans" style="position: absolute; top: 470px; left: 90px; font-size: 24px; color: #888;">
//         has successfully completed
//       </div>
//       <div class="canvas-sans" style="position: absolute; top: 510px; left: 90px; font-size: 32px; font-weight: bold; color: #222;">
//         Yi Chotacop
//       </div>
//     `;
//     return tempDiv;
//   };

//   /**
//    * Try rendering the PDF at a given scale + JPEG quality.
//    * Returns { blob, sizeBytes } or throws.
//    */
//   const renderPdfAttempt = async (tempDiv, scale, jpegQuality) => {
//     // Render canvas a bit smaller to keep file size down
//     const canvas = await html2canvas(tempDiv, { scale, useCORS: true });
//     const imgData = canvas.toDataURL("image/jpeg", jpegQuality); // JPEG saves a lot vs PNG

//     const pdf = new jsPDF({
//       orientation: "landscape",
//       unit: "px",
//       format: [1123, 794],
//       compress: true, // enable built-in compression
//     });
//     pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);

//     // get blob and size
//     const blob = pdf.output("blob");
//     const sizeBytes = blob.size;
//     return { blob, sizeBytes };
//   };

//   /**
//    * Generate certificate -> download -> send compressed PDF (< 5MB).
//    * We try multiple (quality, scale) combinations until under 5MB.
//    */
//   const generateAndDownloadCertificate = async () => {
//     const tempDiv = buildCertificateDOM();
//     document.body.appendChild(tempDiv);

//     // Let fonts/images settle
//     await new Promise((r) => setTimeout(r, 350));

//     // Try qualities (best to lowest), then reduce scale
//     const qualityOptions = [0.85, 0.75, 0.65, 0.55, 0.45];
//     const scaleOptions = [2, 1.75, 1.5];

//     let finalBlob = null;
//     let finalSize = 0;
//     let usedQ = null;
//     let usedScale = null;

//     for (const sc of scaleOptions) {
//       for (const q of qualityOptions) {
//         try {
//           const { blob, sizeBytes } = await renderPdfAttempt(tempDiv, sc, q);
//           if (sizeBytes <= FIVE_MB) {
//             finalBlob = blob;
//             finalSize = sizeBytes;
//             usedQ = q;
//             usedScale = sc;
//             break;
//           }
//           // Keep the smallest so far in case none fall under 5 MB
//           if (!finalBlob || sizeBytes < finalSize) {
//             finalBlob = blob;
//             finalSize = sizeBytes;
//             usedQ = q;
//             usedScale = sc;
//           }
//         } catch (e) {
//           console.error("PDF render attempt failed:", e);
//         }
//       }
//       if (finalBlob && finalSize <= FIVE_MB) break;
//     }

//     // Clean up DOM
//     document.body.removeChild(tempDiv);

//     if (!finalBlob) {
//       throw new Error("Failed to generate certificate PDF.");
//     }

//     // Download the (compressed) certificate for the user
//     // (We keep filename same)
//     const dlUrl = URL.createObjectURL(finalBlob);
//     const a = document.createElement("a");
//     a.href = dlUrl;
//     a.download = "ChotaCop_Certificate.pdf";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(dlUrl);

//     console.log(
//       `Certificate ready. Size: ${(finalSize / (1024 * 1024)).toFixed(
//         2
//       )} MB, scale=${usedScale}, quality=${usedQ}`
//     );
//     return finalBlob; // return compressed blob for emailing
//   };

//   const sendCertificateToEmail = async (pdfBlob) => {
//     const file = new File([pdfBlob], "ChotaCop_Certificate.pdf", {
//       type: "application/pdf",
//     });
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("email", studentInfo.email);

//     try {
//       await axios.post("https://chotacop.in/api/send-pdf", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });
//     } catch (err) {
//       alert(
//         "Failed to send certificate to email: " +
//           (err.response?.data?.detail || err.message)
//       );
//     }
//   };

//   // Button handler: ensure completed + submit, then generate (compressed) and email
//   const handleDownloadCertificate = async () => {
//     if (!(rideActive.slice(0, 5).every(Boolean) && submitted)) {
//       setPopupMessage(
//         "Please complete the first five rides and submit before generating the certificate."
//       );
//       setPopupOpen(true);
//       return;
//     }
//     try {
//       const compressedBlob = await generateAndDownloadCertificate();
//       await sendCertificateToEmail(compressedBlob);
//     } catch (e) {
//       console.error(e);
//       alert("Could not generate/send certificate. Please try again.");
//     }
//   };
//   // ======================= END CERTIFICATE SECTION =======================

//   const handleSubmit = async () => {
//     const updatedSubmitted = submittedRides.map(() => true);
//     setSubmittedRides(updatedSubmitted);
//     await sendAnswersToBackend();
//     setSubmitted(true);
//     setPopupMessage("Submitted successfully!");
//     setPopupOpen(true);
//   };

//   const sendAnswersToBackend = async () => {
//     const data = {
//       email: studentInfo.email,
//       chapter: studentInfo.chapter,
//       name: studentInfo.name,
//       school: studentInfo.school,
//       class_: studentInfo.class,
//     };
//     const activeRidesAnswers = ridesAnswers.filter(
//       (_, rideIdx) => rideActive[rideIdx]
//     );
//     for (let q = 0; q < questions.length; q++) {
//       data[`q${q + 1}`] = activeRidesAnswers.map((ride) => (ride[q] ? 1 : 0));
//     }
//     data["q13"] = data["q1"];
//     for (let i = 0; i < experienceAnswers.length; i++) {
//       data[`c${i + 1}`] = experienceAnswers[i] ? 1 : 0;
//     }
//     data["c5"] = parentZoneAnswers[0] ? 1 : 0;
//     try {
//       await axios.post("https://chotacop.in/api/upload", data, {
//         headers: { "Content-Type": "application/json" },
//       });
//     } catch (err) {
//       alert(
//         "Failed to submit data: " +
//           (err.response?.data?.detail || err.message)
//       );
//     }
//   };

//   const isStudentInfoComplete = Object.values(studentInfo).every(
//     (v) => v.trim() !== ""
//   );

//   return (
//     <div className="min-h-screen bg-[#fdf5eb]">
//       <Popup open={popupOpen} onClose={() => setPopupOpen(false)}>
//         {popupMessage}
//       </Popup>
//       <Header hideAuthLinks={true} showHomeOnQuestions={true} />
//       <div className="w-full max-w-8xl mx-auto p-6 md:p-10">
//         {/* Student Info Form */}
//         <div className="bg-[#fdf6bf] shadow-xl rounded-2xl p-6 mb-8 mt-[-40px]">
//           <div className="flex flex-wrap gap-6 justify-between items-center">
//             {/* Desktop: Chotacop Card Button above email */}
//             <div className="w-full mb-4 hidden md:block">
//               <button
//                 type="button"
//                 onClick={handleDownloadReportCard}
//                 className="w-fit px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
//                 title="Download Chota Cop Report Card"
//               >
//                 Chotacop Card PDF (Optional) ⬇️
//               </button>
//             </div>
//             {/* Mobile: Chotacop Card Button above email */}
//             <div className="w-full block md:hidden mb-2">
//               <button
//                 type="button"
//                 onClick={handleDownloadReportCard}
//                 className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
//                 title="Download Chota Cop Report Card"
//               >
//                 Chotacop Card PDF (Optional) ⬇️
//               </button>
//             </div>

//             {/* Email + Check + Captcha */}
//             <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
//               <div className="flex items-center gap-2">
//                 <input
//                   type="email"
//                   name="email"
//                   placeholder="Email"
//                   value={studentInfo.email}
//                   onChange={handleInputChange}
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2"
//                 />
//                 <button
//                   type="button"
//                   onClick={handleCheckEmail}
//                   className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
//                   disabled={checkingEmail}
//                   title="Check Email"
//                 >
//                   {checkingEmail ? "Checking..." : "Check"}
//                 </button>
//               </div>

//               {showCaptcha && SITE_KEY && (
//                 <ReCAPTCHA
//                   ref={recaptchaRef}
//                   sitekey={SITE_KEY}
//                   onChange={handleCaptchaComplete}
//                   onExpired={handleCaptchaExpired}
//                   onErrored={handleCaptchaErrored}
//                 />
//               )}

//               {showCaptcha && !SITE_KEY && (
//                 <div className="text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2">
//                   reCAPTCHA site key is missing. Please add{" "}
//                   <b>VITE_RECAPTCHA_SITE_KEY</b> in your <code>.env</code>.
//                 </div>
//               )}
//             </div>

//             <select
//               name="chapter"
//               value={studentInfo.chapter}
//               onChange={handleInputChange}
//               className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-4 py-2"
//             >
//               <option value="">Select Chapter</option>
//               <option value="Agra">Agra</option>
//               <option value="Ahmedabad">Ahmedabad</option>
//               <option value="Ajmer">Ajmer</option>
//               <option value="Amaravati">Amaravati</option>
//               <option value="Balasore">Balasore</option>
//               <option value="Bengaluru">Bengaluru</option>
//               <option value="Bhopal">Bhopal</option>
//               <option value="Bhavnagar">Bhavnagar</option>
//               <option value="Bhubaneswar">Bhubaneswar</option>
//               <option value="Chandigarh">Chandigarh</option>
//               <option value="Chennai">Chennai</option>
//               <option value="Chhatrapati Sambhajinagar">
//                 Chhatrapati Sambhajinagar
//               </option>
//               <option value="Coimbatore">Coimbatore</option>
//               <option value="Dehradun">Dehradun</option>
//               <option value="Delhi">Delhi</option>
//               <option value="Dindigul">Dindigul</option>
//               <option value="Durg">Durg</option>
//               <option value="Erode">Erode</option>
//               <option value="Goa">Goa</option>
//               <option value="Gurugram">Gurugram</option>
//               <option value="Guwahati">Guwahati</option>
//               <option value="Gwalior">Gwalior</option>
//               <option value="Hosur">Hosur</option>
//               <option value="Hubballi">Hubballi</option>
//               <option value="Hyderabad">Hyderabad</option>
//               <option value="Indore">Indore</option>
//               <option value="Jaipur">Jaipur</option>
//               <option value="Jabalpur">Jabalpur</option>
//               <option value="Jamshedpur">Jamshedpur</option>
//               <option value="Kanpur">Kanpur</option>
//               <option value="Karur">Karur</option>
//               <option value="Kochi">Kochi</option>
//               <option value="Kolkata">Kolkata</option>
//               <option value="Kota">Kota</option>
//               <option value="Kozhikode">Kozhikode</option>
//               <option value="Lucknow">Lucknow</option>
//               <option value="Madurai">Madurai</option>
//               <option value="Mangaluru">Mangaluru</option>
//               <option value="Mumbai">Mumbai</option>
//               <option value="Mysuru">Mysuru</option>
//               <option value="Nagaland">Nagaland</option>
//               <option value="Nagpur">Nagpur</option>
//               <option value="Nashik">Nashik</option>
//               <option value="Noida">Noida</option>
//               <option value="Puducherry">Puducherry</option>
//               <option value="Pune">Pune</option>
//               <option value="Raipur">Raipur</option>
//               <option value="Rajkot">Rajkot</option>
//               <option value="Ranchi">Ranchi</option>
//               <option value="Salem">Salem</option>
//               <option value="Sikkim">Sikkim</option>
//               <option value="Siliguri">Siliguri</option>
//               <option value="Sivakasi">Sivakasi</option>
//               <option value="Surat">Surat</option>
//               <option value="Thoothukudi">Thoothukudi</option>
//               <option value="Tirupur">Tirupur</option>
//               <option value="Tirupati">Tirupati</option>
//               <option value="Trichy">Trichy</option>
//               <option value="Trivandrum">Trivandrum</option>
//               <option value="Vadodara">Vadodara</option>
//               <option value="Varanasi">Varanasi</option>
//               <option value="Vellore">Vellore</option>
//               <option value="Vizag">Vizag</option>
//             </select>

//             <input
//               type="text"
//               name="name"
//               placeholder="Name"
//               value={studentInfo.name}
//               onChange={handleInputChange}
//               className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-4 py-2"
//             />
//             <input
//               type="text"
//               name="school"
//               placeholder="School"
//               value={studentInfo.school}
//               onChange={handleInputChange}
//               className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-4 py-2"
//             />
//             <div className="flex items-center gap-4 flex-1 min-w-[250px]">
//               <select
//                 name="class"
//                 value={studentInfo.class}
//                 onChange={handleInputChange}
//                 className="w-full border border-gray-300 rounded-lg px-4 py-2"
//               >
//                 <option value="">Select Class</option>
//                 {Array.from({ length: 12 }, (_, i) => (
//                   <option key={i + 1} value={i + 1}>{`Class ${i + 1}`}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Main Questions Table - DESKTOP VIEW */}
//         <div className="overflow-auto hidden md:block">
//           <table className="table-auto w-full border-collapse bg-[#fdf5eb] shadow-xl rounded-2xl overflow-hidden">
//             <thead className="bg-[#fdf6bf]">
//               <tr>
//                 <th className="text-left p-4 text-gray-700">Questions</th>
//                 {Array.from({ length: TOTAL_RIDES }, (_, i) => (
//                   <th key={i} className="text-center p-4 text-gray-700">
//                     <div className="flex items-center justify-center gap-2">
//                       {`Ride ${i + 1}`}
//                       <input
//                         type="checkbox"
//                         checked={rideActive[i]}
//                         onChange={() => handleRideCheckbox(i)}
//                         className="accent-red-600 w-4 h-4"
//                       />
//                     </div>
//                   </th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {questions.map((question, qIdx) => (
//                 <tr key={qIdx} className="border-t">
//                   <td className="p-4 text-sm font-medium text-gray-800">
//                     {question}
//                   </td>
//                   {Array.from({ length: TOTAL_RIDES }, (_, rideIdx) => {
//                     const isAnswered = ridesAnswers[rideIdx][qIdx];
//                     const isActive = rideActive[rideIdx];
//                     return (
//                       <td key={rideIdx} className="p-4 text-center">
//                         <div
//                           onClick={() => isActive && handleToggle(rideIdx, qIdx)}
//                           className={`relative w-14 h-6 rounded-full mx-auto flex items-center px-1 transition-colors duration-300 cursor-pointer
//                             ${
//                               !isActive
//                                 ? "bg-gray-300 cursor-not-allowed"
//                                 : isAnswered
//                                 ? "bg-green-500"
//                                 : "bg-red-500"
//                             }`}
//                           style={{
//                             pointerEvents: isActive ? "auto" : "none",
//                             opacity: isActive ? 1 : 0.6,
//                           }}
//                         >
//                           <span className="text-white text-xs font-bold w-1/2 text-center z-10">
//                             Y
//                           </span>
//                           <span className="text-white text-xs font-bold w-1/2 text-center z-10">
//                             N
//                           </span>
//                           <div
//                             className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300
//                               ${
//                                 isAnswered ? "translate-x-full" : "translate-x-0"
//                               }`}
//                           />
//                         </div>
//                       </td>
//                     );
//                   })}
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>

//         {/* MOBILE VIEW */}
//         <div className="md:hidden bg-[#fdf5eb] shadow-xl rounded-2xl p-4">
//           <div className="flex items-center gap-2 mb-2 font-bold text-gray-600 text-sm">
//             {Array.from({ length: TOTAL_RIDES }, (_, i) => (
//               <span
//                 key={i}
//                 className="w-12 text-center flex items-center justify-center gap-1"
//               >
//                 {i + 1}
//                 <input
//                   type="checkbox"
//                   checked={rideActive[i]}
//                   onChange={() => handleRideCheckbox(i)}
//                   className="accent-red-600 w-4 h-4"
//                 />
//               </span>
//             ))}
//           </div>
//           <div className="flex items-center gap-4 mb-4">
//             <div className="flex items-center gap-1">
//               <span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span>
//               <span className="text-xs text-gray-700">Yes</span>
//             </div>
//             <div className="flex items-center gap-1">
//               <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span>
//               <span className="text-xs text-gray-700">No</span>
//             </div>
//           </div>
//           {questions.map((question, qIdx) => (
//             <div key={qIdx} className="mb-4 border-t pt-4">
//               <p className="text-gray-800 font-medium text-sm mb-2">
//                 {question}
//               </p>
//               <div className="flex items-center gap-2">
//                 {Array.from({ length: TOTAL_RIDES }, (_, rideIdx) => {
//                   const isAnswered = ridesAnswers[rideIdx][qIdx];
//                   const isActive = rideActive[rideIdx];
//                   return (
//                     <div
//                       key={rideIdx}
//                       onClick={() => isActive && handleToggle(rideIdx, qIdx)}
//                       className={`relative w-10 h-5 rounded-full flex items-center px-1 transition-colors duration-300 cursor-pointer
//                         ${
//                           !isActive
//                             ? "bg-gray-300 cursor-not-allowed"
//                             : isAnswered
//                             ? "bg-green-500"
//                             : "bg-red-500"
//                         }`}
//                       style={{
//                         pointerEvents: isActive ? "auto" : "none",
//                         opacity: isActive ? 1 : 0.6,
//                       }}
//                     >
//                       <div
//                         className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300
//                           ${isAnswered ? "translate-x-5" : "translate-x-0"}`}
//                       />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Experience Zone */}
//         <Ex_Zone
//           answers={experienceAnswers}
//           setAnswers={setExperienceAnswers}
//           parentAnswers={parentZoneAnswers}
//           setParentAnswers={setParentZoneAnswers}
//           disabled={!rideActive.slice(0, 5).every(Boolean)}
//           onPopup={(msg) => {
//             setPopupMessage(msg);
//             setPopupOpen(true);
//           }}
//         />

//         {/* PDF Upload */}
//         <ImageUploader />

//         {/* Submit Button */}
//         <div className="flex justify-center mt-8 gap-4 relative">
//           <button
//             onClick={handleSubmit}
//             disabled={!isStudentInfoComplete}
//             className={`px-6 py-3 rounded-xl font-bold text-white transition-colors duration-300 ${
//               isStudentInfoComplete
//                 ? "bg-green-600 hover:bg-green-700"
//                 : "bg-gray-400 cursor-not-allowed"
//             }`}
//           >
//             Submit
//           </button>
//           <div className="relative">
//             <button
//               onClick={handleDownloadCertificate}
//               disabled={!(submitted && rideActive.slice(0, 5).every(Boolean))}
//               onMouseEnter={() => {
//                 if (!(submitted && rideActive.slice(0, 5).every(Boolean)))
//                   setShowCertTooltip(true);
//               }}
//               onMouseLeave={() => setShowCertTooltip(false)}
//               onFocus={() => {
//                 if (!(submitted && rideActive.slice(0, 5).every(Boolean)))
//                   setShowCertTooltip(true);
//               }}
//               onBlur={() => setShowCertTooltip(false)}
//               className={`px-6 py-3 rounded-xl font-bold text-white transition-colors duration-300 ${
//                 submitted && rideActive.slice(0, 5).every(Boolean)
//                   ? "bg-blue-600 hover:bg-blue-700"
//                   : "bg-gray-400 cursor-not-allowed"
//               }`}
//             >
//               Download Certificate
//             </button>
//             {showCertTooltip && (
//               <div className="absolute left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-black text-white text-xs rounded shadow-lg z-50 whitespace-nowrap">
//                 After answering the first five rides and submitting the answer,
//                 you can get your certificate.
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default QuestionTogglePage;




import React, { useState, useRef, useEffect } from "react";
import Header from "../components/Header";
import ImageUploader from "../components/Image_Uploader"; // Not used, but kept for context
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Ex_Zone from "../components/Ex_Zone"; // Not used, but kept for context
import axios from "axios";
import Popup from "../components/Popup";
import ReCAPTCHA from "react-google-recaptcha";

// ------------------------ your existing constants ------------------------
const GOOGLE_TEST_V2_SITE_KEY = "6LehoagrAAAAAAfoIaDMGJJI8LkRGqaewejitNFG";
const ENV_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const SITE_KEY =
  ENV_SITE_KEY ||
  (typeof window !== "undefined" && window.location.hostname === "localhost"
    ? GOOGLE_TEST_V2_SITE_KEY
    : "");

const questions = [
  "Were you riding with a parent?",
  "If on a bike or scooter, did everyone wear a helmet?",
  "If in a car, did everyone wear a seatbelt?",
  "Did the driver honk too much?",
  "Did the driver follow traffic lights?",
  "At a red light, did the driver stop at the white line?",
  "Did the driver use a phone while driving?",
  "Did the driver keep changing lanes?",
  "Did the driver go into a \"No Entry\" road?",
  "Did the driver stop for people walking (pedestrians)?",
  "If in an auto, were too many people sitting inside?",
  "If on a two-wheeler, were three people riding on it?",
  "Did your driver have a license and insurance?",
];

const TOTAL_RIDES = 7;
const experienceQuestionsCount = 4;
const parentQuestionsCount = 2; // Unused, but kept as a hint for future features
const FIVE_MB = 5 * 1024 * 1024;

const QuestionTogglePage = () => {
  // ------------------------ state ------------------------
  const [ridesAnswers, setRidesAnswers] = useState(
    Array(TOTAL_RIDES)
      .fill(null)
      .map(() => Array(questions.length).fill(false))
  );
  const [submittedRides, setSubmittedRides] = useState(
    Array(TOTAL_RIDES).fill(false)
  );
  const [studentInfo, setStudentInfo] = useState({
    name: "",
    class: "",
    chapter: "",
    school: "",
    email: "",
  });
  const [experienceAnswers, setExperienceAnswers] = useState(
    Array(experienceQuestionsCount).fill(false)
  );
  const [parentZoneAnswers, setParentZoneAnswers] = useState(
    Array(parentQuestionsCount).fill(false)
  );
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [rideActive, setRideActive] = useState(Array(TOTAL_RIDES).fill(false));
  const [submitted, setSubmitted] = useState(false);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showCertTooltip, setShowCertTooltip] = useState(false);

  // NEW: SCHOOL INTEGRATION STATE
  const [availableSchools, setAvailableSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolsError, setSchoolsError] = useState("");
  
  // captcha state
  const [showCaptcha, setShowCaptcha] = useState(false);
  const recaptchaRef = useRef(null);

  // ------------------------ handlers ------------------------
  const handleToggle = (rideIdx, questionIdx) => {
    if (!isStudentInfoComplete) {
      setPopupMessage(
        "Please fill in all student information before answering."
      );
      setPopupOpen(true);
      return;
    }
    if (!rideActive[rideIdx]) {
      setPopupMessage(
        "Activate this ride by checking the box before answering."
      );
      setPopupOpen(true);
      return;
    }
    if (submittedRides[rideIdx]) return;
    const updatedAnswers = [...ridesAnswers];
    updatedAnswers[rideIdx][questionIdx] = !updatedAnswers[rideIdx][questionIdx];
    setRidesAnswers(updatedAnswers);
  };

  const handleRideCheckbox = (idx) => {
    setRideActive((prev) => {
      const newActive = [...prev];
      if (!newActive[idx]) {
        // Activating a ride
        if (idx === 0 || newActive[idx - 1]) {
          newActive[idx] = true;
          return newActive;
        } else {
          setPopupMessage(
            `Please activate Ride ${idx} before activating Ride ${idx + 1}.`
          );
          setPopupOpen(true);
          return prev;
        }
      } else {
        // Deactivating a ride
        const anyLaterChecked = newActive.slice(idx + 1).some(Boolean);
        if (anyLaterChecked) {
          setPopupMessage(
            `Please deactivate all rides after Ride ${idx + 1} first.`
          );
          setPopupOpen(true);
          return prev;
        } else {
          newActive[idx] = false;
          // Optionally, reset answers for the deactivated ride
          const newRidesAnswers = [...ridesAnswers];
          newRidesAnswers[idx] = Array(questions.length).fill(false);
          setRidesAnswers(newRidesAnswers);
          return newActive;
        }
      }
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStudentInfo({
      ...studentInfo,
      [name]: value,
    });
  };
  
  // DEBOUNCE LOGIC FOR SCHOOL FETCHING
  useEffect(() => {
    const fetchSchoolsData = async (chapterName) => {
      if (!chapterName.trim()) {
        setAvailableSchools([]);
        setSchoolsError("");
        return;
      }

      setLoadingSchools(true);
      setSchoolsError("");
      
      try {
        const response = await axios.get(`https://chotacop.in/api/get-schools-data`, {
          params: { chapter: chapterName }
        });
        
        if (response.data.success) {
          setAvailableSchools(response.data.data);
        } else {
          setSchoolsError('No schools found for this chapter');
          setAvailableSchools([]);
        }
      } catch (error) {
        console.error('Failed to fetch schools data:', error);
        if (error.response?.status === 404) {
          setSchoolsError('Schools data endpoint not found');
        } else if (error.response?.status === 500) {
          setSchoolsError('Server error. Please try again later.');
        } else {
          setSchoolsError('Failed to fetch schools data. Please check your connection.');
        }
        setAvailableSchools([]);
      } finally {
        setLoadingSchools(false);
      }
    };
    
    // Proper debounce implementation
    const timeoutId = setTimeout(() => {
      if (studentInfo.chapter) {
        setStudentInfo(prev => ({ ...prev, school: "" }));
        fetchSchoolsData(studentInfo.chapter);
      } else {
        setAvailableSchools([]);
        setSchoolsError("");
        setStudentInfo(prev => ({ ...prev, school: "" }));
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [studentInfo.chapter]);

  // EMAIL CHECK: split into 2 steps
  const handleCheckEmail = () => {
    const email = studentInfo.email.trim();
    if (!email) {
      setPopupMessage("Please enter an email.");
      setPopupOpen(true);
      return;
    }
    if (!SITE_KEY) {
      setPopupMessage(
        "reCAPTCHA site key is missing. Add VITE_RECAPTCHA_SITE_KEY to your .env or use the Google test key on localhost."
      );
      setPopupOpen(true);
      return;
    }
    setShowCaptcha(true);
  };

  const handleCaptchaComplete = async (token) => {
    if (!token) return;
    setCheckingEmail(true);
    try {
      await axios.post(
        "https://chotacop.in/api/contact",
        {
          recaptchaToken: token,
          email: studentInfo.email || "",
        },
        { headers: { "Content-Type": "application/json" } }
      );
      await runEmailCheck();
    } catch (e) {
      console.error("reCAPTCHA verification or email check failed:", e);
      alert("reCAPTCHA verification failed. Please try again.");
    } finally {
      recaptchaRef.current?.reset?.();
      setShowCaptcha(false);
      setCheckingEmail(false);
    }
  };

  const handleCaptchaExpired = () => {
    recaptchaRef.current?.reset?.();
  };

  const handleCaptchaErrored = () => {
    console.error("reCAPTCHA failed to load or encountered an error.");
    setPopupMessage(
      "reCAPTCHA failed to load. Please refresh the page or try again later."
    );
    setPopupOpen(true);
  };

  const runEmailCheck = async () => {
    const email = studentInfo.email.trim();
    const res = await axios.post(
      "https://chotacop.in/api/check-mail",
      { email },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    if (res.data.exists) {
      const dataRes = await axios.post(
        "https://chotacop.in/api/email-data",
        { email },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const info = dataRes.data.data && dataRes.data.data[0];

      if (info) {
        setStudentInfo((prev) => ({
          ...prev,
          name: info.name || prev.name,
          class: info.class || info.class_ || prev.class,
          chapter: info.chapter || prev.chapter,
          school: info.school || prev.school,
          email: email,
        }));

        const newRidesAnswers = Array(TOTAL_RIDES)
          .fill(null)
          .map(() => Array(questions.length).fill(false));
        
        // Correctly populate ridesAnswers from API data
        for (let q = 0; q < questions.length; q++) {
          const arr = info[`q${q + 1}`];
          if (Array.isArray(arr)) {
            for (let rideIdx = 0; rideIdx < arr.length; rideIdx++) {
              if (rideIdx < TOTAL_RIDES) {
                newRidesAnswers[rideIdx][q] = arr[rideIdx] === 1;
              }
            }
          }
        }
        setRidesAnswers(newRidesAnswers);

        setExperienceAnswers([
          info.c1 === 1,
          info.c2 === 1,
          info.c3 === 1,
          info.c4 === 1,
        ]);

        setParentZoneAnswers([info.c5 === 1, false]);

        setPopupMessage(`Welcome back, ${info.name || "User"}!`);
        setPopupOpen(true);
      } else {
        setPopupMessage("Welcome back!");
        setPopupOpen(true);
      }
    } else {
      setPopupMessage("Welcome to chotacop!");
      setPopupOpen(true);
    }
  };

  const handleDownloadReportCard = () => {
    const link = document.createElement("a");
    link.href = "/assets/Final Card.pdf";
    link.download = "ChotaCop_ReportCard.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // ------------------------ CERTIFICATE FUNCTIONS ------------------------
  const buildCertificateDOM = (studentInfo) => {
    const tempDiv = document.createElement("div");
    tempDiv.style.position = "absolute";
    tempDiv.style.left = "-9999px";
    tempDiv.style.width = "297mm";
    tempDiv.style.height = "210mm";
    tempDiv.style.backgroundColor = "#ffffff";
    tempDiv.style.fontFamily = "Arial, sans-serif";
    tempDiv.style.display = "flex";
    tempDiv.style.flexDirection = "column";
    tempDiv.style.justifyContent = "center";
    tempDiv.style.alignItems = "center";
    tempDiv.style.padding = "20px";
    tempDiv.style.boxSizing = "border-box";

    tempDiv.innerHTML = `
      <div style="text-align: center;">
        <h1 style="font-size: 48px; color: #2563eb; margin-bottom: 20px; font-weight: bold;">
          Certificate of Achievement
        </h1>
        <div style="width: 100px; height: 4px; background-color: #2563eb; margin: 0 auto 30px;"></div>
        <h2 style="font-size: 24px; margin-bottom: 40px; color: #374151;">
          This certifies that
        </h2>
        <h3 style="font-size: 36px; color: #1f2937; margin-bottom: 30px; font-weight: bold; text-transform: uppercase;">
          ${studentInfo.name}
        </h3>
        <p style="font-size: 20px; margin-bottom: 20px; color: #6b7280;">
          from <strong>${studentInfo.school}</strong>
        </p>
        <p style="font-size: 20px; margin-bottom: 40px; color: #6b7280;">
          Class: <strong>${studentInfo.class}</strong> | Chapter: <strong>${studentInfo.chapter}</strong>
        </p>
        <p style="font-size: 18px; line-height: 1.6; max-width: 600px; margin: 0 auto 50px; color: #374151;">
          has successfully completed the ChotaCop Traffic Safety Program and demonstrated 
          excellent understanding of road safety principles through active participation 
          in multiple ride assessments.
        </p>
        <div style="margin-top: 60px;">
          <p style="font-size: 16px; color: #6b7280; margin-bottom: 10px;">
            Issued on ${new Date().toLocaleDateString()}
          </p>
          <p style="font-size: 16px; color: #6b7280;">
            ChotaCop Traffic Safety Initiative
          </p>
        </div>
      </div>
    `;

    document.body.appendChild(tempDiv);
    return tempDiv;
  };

  const renderPdfAttempt = async (tempDiv, scale, jpegQuality) => {
    const canvas = await html2canvas(tempDiv, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", jpegQuality);
    const pdf = new jsPDF("landscape", "mm", "a4");
    const imgWidth = 297;
    const imgHeight = 210;
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
    
    return pdf.output("blob");
  };

  const generateAndDownloadCertificate = async (studentInfo, FIVE_MB) => {
    const tempDiv = buildCertificateDOM(studentInfo);

    try {
      const attempts = [
        { scale: 2, jpegQuality: 0.9 },
        { scale: 1.5, jpegQuality: 0.8 },
        { scale: 1, jpegQuality: 0.7 },
        { scale: 1, jpegQuality: 0.5 },
        { scale: 0.8, jpegQuality: 0.4 },
      ];

      for (const attempt of attempts) {
        const blob = await renderPdfAttempt(tempDiv, attempt.scale, attempt.jpegQuality);
        if (blob.size <= FIVE_MB) {
          console.log(`Certificate generated successfully with scale=${attempt.scale}, quality=${attempt.jpegQuality}, size=${(blob.size / (1024 * 1024)).toFixed(2)}MB`);
          return blob;
        }
      }

      throw new Error(`Could not compress certificate below ${FIVE_MB / (1024 * 1024)}MB`);
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  const sendCertificateToEmail = async (pdfBlob, email) => {
    const formData = new FormData();
    formData.append("certificate", pdfBlob, "ChotaCop_Certificate.pdf");
    formData.append("email", email);

    await axios.post("https://chotacop.in/api/send-certificate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    alert(`Certificate sent to ${email} successfully!`);
  };

  // Button handler: ensure completed + submit, then generate (compressed) and email
  const handleDownloadCertificate = async () => {
    // Check if at least 5 rides are active and all their questions are answered
    const activeRides = rideActive.filter(Boolean).length;
    const completedRides = ridesAnswers.filter((answers, idx) => rideActive[idx] && answers.every(Boolean)).length;
    
    if (activeRides < 5 || completedRides !== activeRides || !submitted) {
      setPopupMessage(
        "To get your certificate, you must activate and answer all questions for at least 5 rides and submit the form."
      );
      setPopupOpen(true);
      return;
    }
    
    try {
      const compressedBlob = await generateAndDownloadCertificate(studentInfo, FIVE_MB);
      await sendCertificateToEmail(compressedBlob, studentInfo.email);
    } catch (e) {
      console.error(e);
      alert("Could not generate/send certificate. Please try again.");
    }
  };

  const handleSubmit = async () => {
    const updatedSubmitted = submittedRides.map((_, idx) => rideActive[idx]);
    setSubmittedRides(updatedSubmitted);
    await sendAnswersToBackend();
    setSubmitted(true);
    setPopupMessage("Submitted successfully!");
    setPopupOpen(true);
  };

  const sendAnswersToBackend = async () => {
    const data = {
      email: studentInfo.email,
      chapter: studentInfo.chapter,
      name: studentInfo.name,
      school: studentInfo.school,
      class_: studentInfo.class,
    };
    
    // Filter ridesAnswers to include only active rides' data
    const activeRidesAnswers = ridesAnswers.filter(
      (_, rideIdx) => rideActive[rideIdx]
    );

    for (let q = 0; q < questions.length; q++) {
      data[`q${q + 1}`] = activeRidesAnswers.map((ride) => (ride[q] ? 1 : 0));
    }
    
    for (let i = 0; i < experienceAnswers.length; i++) {
      data[`c${i + 1}`] = experienceAnswers[i] ? 1 : 0;
    }
    data["c5"] = parentZoneAnswers[0] ? 1 : 0;
    
    try {
      await axios.post("https://chotacop.in/api/upload", data, {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      alert(
        "Failed to submit data: " +
        (err.response?.data?.detail || err.message)
      );
    }
  };

  const isStudentInfoComplete = Object.values(studentInfo).every(
    (v) => v.trim() !== ""
  );

  return (
    <div className="min-h-screen bg-[#fdf5eb]">
      <Popup open={popupOpen} onClose={() => setPopupOpen(false)}>
        {popupMessage}
      </Popup>
      <Header hideAuthLinks={true} showHomeOnQuestions={true} />
      <div className="w-full max-w-8xl mx-auto p-6 md:p-10">
        {/* Student Info Form */}
        <div className="bg-[#fdf6bf] shadow-xl rounded-2xl p-6 mb-8 mt-[-40px]">
          <div className="flex flex-wrap gap-6 justify-between items-center">
            {/* Download Card Button */}
            <div className="w-full mb-4">
              <button
                type="button"
                onClick={handleDownloadReportCard}
                className="w-full md:w-fit px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
                title="Download Chota Cop Report Card"
              >
                Chotacop Card PDF (Optional) ⬇
              </button>
            </div>

            {/* Email + Check + Captcha */}
            <div className="flex flex-col gap-2 flex-1 min-w-[250px]">
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={studentInfo.email}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
                <button
                  type="button"
                  onClick={handleCheckEmail}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                  disabled={checkingEmail}
                  title="Check Email"
                >
                  {checkingEmail ? "Checking..." : "Check"}
                </button>
              </div>

              {showCaptcha && SITE_KEY && (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={SITE_KEY}
                  onChange={handleCaptchaComplete}
                  onExpired={handleCaptchaExpired}
                  onErrored={handleCaptchaErrored}
                />
              )}
              
              {/* Corrected and simplified captcha key warning */}
              {showCaptcha && !SITE_KEY && (
                <div className="text-sm text-red-700 bg-red-100 border border-red-300 rounded p-2">
                  reCAPTCHA site key is missing. Add *VITE_RECAPTCHA_SITE_KEY* in your `.env`.
                </div>
              )}
            </div>

            {/* Chapter & School Selects and Other Inputs */}
            <select
              name="chapter"
              value={studentInfo.chapter}
              onChange={handleInputChange}
              className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-4 py-2"
            >
              <option value="">Select Chapter</option>
              <option value="Agra">Agra</option>
              <option value="Ahmedabad">Ahmedabad</option>
              <option value="Ajmer">Ajmer</option>
              <option value="Amaravati">Amaravati</option>
              <option value="Balasore">Balasore</option>
              <option value="Bengaluru">Bengaluru</option>
              <option value="Bhopal">Bhopal</option>
              <option value="Bhavnagar">Bhavnagar</option>
              <option value="Bhubaneswar">Bhubaneswar</option>
              <option value="Chandigarh">Chandigarh</option>
              <option value="Chennai">Chennai</option>
              <option value="Chhatrapati Sambhajinagar">
                Chhatrapati Sambhajinagar
              </option>
              <option value="Coimbatore">Coimbatore</option>
              <option value="Dehradun">Dehradun</option>
              <option value="Delhi">Delhi</option>
              <option value="Dindigul">Dindigul</option>
              <option value="Durg">Durg</option>
              <option value="Erode">Erode</option>
              <option value="Goa">Goa</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Guwahati">Guwahati</option>
              <option value="Gwalior">Gwalior</option>
              <option value="Hosur">Hosur</option>
              <option value="Hubballi">Hubballi</option>
              <option value="Hyderabad">Hyderabad</option>
              <option value="Indore">Indore</option>
              <option value="Jaipur">Jaipur</option>
              <option value="Jabalpur">Jabalpur</option>
              <option value="Jamshedpur">Jamshedpur</option>
              <option value="Kanpur">Kanpur</option>
              <option value="Karur">Karur</option>
              <option value="Kochi">Kochi</option>
              <option value="Kolkata">Kolkata</option>
              <option value="Kota">Kota</option>
              <option value="Kozhikode">Kozhikode</option>
              <option value="Lucknow">Lucknow</option>
              <option value="Madurai">Madurai</option>
              <option value="Mangaluru">Mangaluru</option>
              <option value="Mumbai">Mumbai</option>
              <option value="Mysuru">Mysuru</option>
              <option value="Nagaland">Nagaland</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Nashik">Nashik</option>
              <option value="Noida">Noida</option>
              <option value="Puducherry">Puducherry</option>
              <option value="Pune">Pune</option>
              <option value="Raipur">Raipur</option>
              <option value="Rajkot">Rajkot</option>
              <option value="Ranchi">Ranchi</option>
              <option value="Salem">Salem</option>
              <option value="Sikkim">Sikkim</option>
              <option value="Siliguri">Siliguri</option>
              <option value="Sivakasi">Sivakasi</option>
              <option value="Surat">Surat</option>
              <option value="Thoothukudi">Thoothukudi</option>
              <option value="Tirupur">Tirupur</option>
              <option value="Tirupati">Tirupati</option>
              <option value="Trichy">Trichy</option>
              <option value="Trivandrum">Trivandrum</option>
              <option value="Vadodara">Vadodara</option>
              <option value="Varanasi">Varanasi</option>
              <option value="Vellore">Vellore</option>
              <option value="Vizag">Vizag</option>
            </select>
            
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={studentInfo.name}
              onChange={handleInputChange}
              className="flex-1 min-w-[180px] border border-gray-300 rounded-lg px-4 py-2"
            />
            
            <div className="flex flex-col flex-1 min-w-[180px]">
              <select
                name="school"
                value={studentInfo.school}
                onChange={handleInputChange}
                disabled={!studentInfo.chapter || loadingSchools}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!studentInfo.chapter 
                    ? "Select Chapter First" 
                    : loadingSchools 
                    ? "Loading Schools..." 
                    : availableSchools.length === 0
                    ? "No Schools Available"
                    : "Select School"}
                </option>
                {availableSchools.map((school) => (
                  <option key={school.id} value={school.name}>
                    {school.name}
                  </option>
                ))}
              </select>
              
              {schoolsError && (
                <div className="text-xs text-red-600 mt-1">
                  {schoolsError}
                </div>
              )}
              
              {loadingSchools && (
                <div className="text-xs text-blue-600 mt-1">
                  Loading schools for {studentInfo.chapter}...
                </div>
              )}
              
              {studentInfo.chapter && availableSchools.length === 0 && !loadingSchools && !schoolsError && (
                <div className="text-xs text-gray-600 mt-1">
                  No schools found for "{studentInfo.chapter}"
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 flex-1 min-w-[250px]">
              <select
                name="class"
                value={studentInfo.class}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="">Select Class</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>{`Class ${i + 1}`}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Questions Table - DESKTOP VIEW */}
        <div className="overflow-auto hidden md:block">
          <table className="table-auto w-full border-collapse bg-[#fdf5eb] shadow-xl rounded-2xl overflow-hidden">
            <thead className="bg-[#fdf6bf]">
              <tr>
                <th className="text-left p-4 text-gray-700">Questions</th>
                {Array.from({ length: TOTAL_RIDES }, (_, i) => (
                  <th key={i} className="text-center p-4 text-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      {`Ride ${i + 1}`}
                      <input
                        type="checkbox"
                        checked={rideActive[i]}
                        onChange={() => handleRideCheckbox(i)}
                        className="accent-red-600 w-4 h-4"
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {questions.map((question, qIdx) => (
                <tr key={qIdx} className="border-t">
                  <td className="p-4 text-sm font-medium text-gray-800">
                    {question}
                  </td>
                  {Array.from({ length: TOTAL_RIDES }, (_, rideIdx) => {
                    const isAnswered = ridesAnswers[rideIdx][qIdx];
                    const isActive = rideActive[rideIdx];
                    return (
                      <td key={rideIdx} className="p-4 text-center">
                        <div
                          onClick={() => isActive && handleToggle(rideIdx, qIdx)}
                          className={`relative w-14 h-6 rounded-full mx-auto flex items-center px-1 transition-colors duration-300 cursor-pointer
                            ${
                              !isActive
                                ? "bg-gray-300 cursor-not-allowed"
                                : isAnswered
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          style={{
                            pointerEvents: isActive ? "auto" : "none",
                            opacity: isActive ? 1 : 0.6,
                          }}
                        >
                          <span className="text-white text-xs font-bold w-1/2 text-center z-10">
                            Y
                          </span>
                          <span className="text-white text-xs font-bold w-1/2 text-center z-10">
                            N
                          </span>
                          <div
                            className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300
                              ${
                                isAnswered ? "translate-x-full" : "translate-x-0"
                              }`}
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-6">
          {Array.from({ length: TOTAL_RIDES }, (_, rideIdx) => (
            <div key={rideIdx} className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-[#fdf6bf] p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">{`Ride ${rideIdx + 1}`}</h3>
                  <input
                    type="checkbox"
                    checked={rideActive[rideIdx]}
                    onChange={() => handleRideCheckbox(rideIdx)}
                    className="accent-red-600 w-5 h-5"
                  />
                </div>
              </div>
              <div className="p-4 space-y-4">
                {questions.map((question, qIdx) => {
                  const isAnswered = ridesAnswers[rideIdx][qIdx];
                  const isActive = rideActive[rideIdx];
                  return (
                    <div key={qIdx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-800 flex-1 pr-4">
                        {question}
                      </span>
                      <div
                        onClick={() => isActive && handleToggle(rideIdx, qIdx)}
                        className={`relative w-14 h-6 rounded-full flex items-center px-1 transition-colors duration-300 cursor-pointer
                          ${
                            !isActive
                              ? "bg-gray-300 cursor-not-allowed"
                              : isAnswered
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        style={{
                          pointerEvents: isActive ? "auto" : "none",
                          opacity: isActive ? 1 : 0.6,
                        }}
                      >
                        <span className="text-white text-xs font-bold w-1/2 text-center z-10">
                          Y
                        </span>
                        <span className="text-white text-xs font-bold w-1/2 text-center z-10">
                          N
                        </span>
                        <div
                          className={`absolute w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300
                            ${
                              isAnswered ? "translate-x-full" : "translate-x-0"
                            }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleSubmit}
            disabled={!isStudentInfoComplete || submitted}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? "Submitted ✓" : "Submit Answers"}
          </button>
          
          <div className="relative">
            <button
              onClick={handleDownloadCertificate}
              onMouseEnter={() => setShowCertTooltip(true)}
              onMouseLeave={() => setShowCertTooltip(false)}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
            >
              Get Certificate 📜
            </button>
            
            {showCertTooltip && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10">
                Complete 5+ rides and submit to get certificate
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            )}
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Progress Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {rideActive.filter(Boolean).length}
              </div>
              <div className="text-sm text-gray-600">Active Rides</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {ridesAnswers.filter((answers, idx) => 
                  rideActive[idx] && answers.every(Boolean)
                ).length}
              </div>
              <div className="text-sm text-gray-600">Completed Rides</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {ridesAnswers.reduce((total, answers, idx) => 
                  rideActive[idx] ? total + answers.filter(Boolean).length : total, 0
                )}
              </div>
              <div className="text-sm text-gray-600">Total Yes Answers</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {submitted ? "✓" : "⏳"}
              </div>
              <div className="text-sm text-gray-600">Submission Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionTogglePage;