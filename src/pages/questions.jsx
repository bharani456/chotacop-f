// import React, { useState, useRef, useEffect } from "react";
// import Header from "../components/Header";
// import ImageUploader from "../components/Image_Uploader";
// import html2canvas from "html2canvas";
// import { jsPDF } from "jspdf";
// import Ex_Zone from "../components/Ex_Zone";
// import axios from "axios";
// import Popup from "../components/Popup";
// import ReCAPTCHA from "react-google-recaptcha";

// const GOOGLE_TEST_V2_SITE_KEY = "6LcndMArAAAAAKZ824ZrhdwmU_Z-snsRo5UQPnCQ";
// const ENV_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
// const SITE_KEY =
//   ENV_SITE_KEY ||
//   (typeof window !== "undefined" && window.location.hostname === "localhost"
//     ? GOOGLE_TEST_V2_SITE_KEY
//     : "");

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
//   const [ridesAnswers, setRidesAnswers] = useState(
//     Array(TOTAL_RIDES)
//       .fill(null)
//       .map(() => Array(questions.length).fill(null))
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
//   const [availableSchools, setAvailableSchools] = useState([]);
//   const [loadingSchools, setLoadingSchools] = useState(false);
//   const [schoolsError, setSchoolsError] = useState("");
//   const [showCaptcha, setShowCaptcha] = useState(false);
//   const [isReturningUser, setIsReturningUser] = useState(false);
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
//       const newActive = [...prev];
//       if (!newActive[idx]) {
//         if (idx === 0 || newActive[idx - 1]) {
//           newActive[idx] = true;
//           // Initialize unanswered questions as "No" (false) when ride is first activated, preserve existing answers
//           const newRidesAnswers = [...ridesAnswers];
//           newRidesAnswers[idx] = newRidesAnswers[idx].map((answer) => answer === null ? false : answer);
//           setRidesAnswers(newRidesAnswers);
//           return newActive;
//         } else {
//           setPopupMessage(
//             `Please activate Ride ${idx} before activating Ride ${idx + 1}.`
//           );
//           setPopupOpen(true);
//           return prev;
//         }
//       } else {
//         const anyLaterChecked = newActive.slice(idx + 1).some(Boolean);
//         if (anyLaterChecked) {
//           setPopupMessage(
//             `Please deactivate all rides after Ride ${idx + 1} first.`
//           );
//           setPopupOpen(true);
//           return prev;
//         } else {
//           newActive[idx] = false;
//           const newRidesAnswers = [...ridesAnswers];
//           newRidesAnswers[idx] = Array(questions.length).fill(null);
//           setRidesAnswers(newRidesAnswers);
//           return newActive;
//         }
//       }
//     });
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setStudentInfo({
//       ...studentInfo,
//       [name]: value,
//     });
//   };

//   useEffect(() => {
//     const fetchSchoolsData = async (chapterName) => {
//       if (!chapterName.trim()) {
//         setAvailableSchools([]);
//         setSchoolsError("");
//         return;
//       }

//       setLoadingSchools(true);
//       setSchoolsError("");
      
//       try {
//         const response = await axios.get(`https://chotacop.in/api/get-schools-data`, {
//           params: { chapter: chapterName }
//         });
        
//         if (response.data.success) {
//           setAvailableSchools(response.data.data);
//         } else {
//           setSchoolsError('No schools found for this chapter');
//           setAvailableSchools([]);
//         }
//       } catch (error) {
//         console.error('Failed to fetch schools data:', error);
//         if (error.response?.status === 404) {
//           setSchoolsError('Schools data endpoint not found');
//         } else if (error.response?.status === 500) {
//           setSchoolsError('Server error. Please try again later.');
//         } else {
//           setSchoolsError('Failed to fetch schools data. Please check your connection.');
//         }
//         setAvailableSchools([]);
//       } finally {
//         setLoadingSchools(false);
//       }
//     };
    
//     const timeoutId = setTimeout(() => {
//       if (studentInfo.chapter && !isReturningUser) {
//         setStudentInfo(prev => ({ ...prev, school: "" }));
//         fetchSchoolsData(studentInfo.chapter);
//       } else {
//         setAvailableSchools([]);
//         setSchoolsError("");
//         if (!isReturningUser) {
//           setStudentInfo(prev => ({ ...prev, school: "" }));
//         }
//       }
//     }, 300);
    
//     return () => clearTimeout(timeoutId);
//   }, [studentInfo.chapter, isReturningUser]);

//   const handleCheckEmail = () => {
//     const email = studentInfo.email.trim();
//     if (!email) {
//       setPopupMessage("Please enter an email.");
//       setPopupOpen(true);
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
//       setIsReturningUser(true);
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

//         const newRidesAnswers = Array(TOTAL_RIDES)
//           .fill(null)
//           .map(() => Array(questions.length).fill(null));
        
//         for (let q = 0; q < questions.length; q++) {
//           const arr = info[`q${q + 1}`];
//           if (Array.isArray(arr)) {
//             for (let rideIdx = 0; rideIdx < arr.length; rideIdx++) {
//               if (rideIdx < TOTAL_RIDES) {
//                 newRidesAnswers[rideIdx][q] = arr[rideIdx] === 1;
//               }
//             }
//           }
//         }
//         setRidesAnswers(newRidesAnswers);

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
//       setIsReturningUser(false);
//       setPopupMessage("Welcome to chotacop!");
//       setPopupOpen(true);
//     }
//   };

//   const handleDownloadReportCard = () => {
//     const link = document.createElement("a");
//     link.href = "/assets/Final Card.pdf";
//     link.download = "ChotaCop_ReportCard.pdf";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

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
//       <div className="canvas-sans" style="position: absolute; top: 470px; left: 90px; font-size: 24px; color: #888;">
//         has successfully completed
//       </div>
//       <div className="canvas-sans" style="position: absolute; top: 510px; left: 90px; font-size: 32px; font-weight: bold; color: #222;">
//         Yi Chotacop
//       </div>
//     `;
//     return tempDiv;
//   };

//   const renderPdfAttempt = async (tempDiv, scale, jpegQuality) => {
//     const canvas = await html2canvas(tempDiv, { scale, useCORS: true });
//     const imgData = canvas.toDataURL("image/jpeg", jpegQuality);
//     const pdf = new jsPDF({
//       orientation: "landscape",
//       unit: "px",
//       format: [1123, 794],
//       compress: true,
//     });
//     pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);
//     const blob = pdf.output("blob");
//     const sizeBytes = blob.size;
//     return { blob, sizeBytes };
//   };

//   const generateAndDownloadCertificate = async () => {
//     const tempDiv = buildCertificateDOM();
//     document.body.appendChild(tempDiv);

//     await new Promise((r) => setTimeout(r, 350));

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

//     document.body.removeChild(tempDiv);

//     if (!finalBlob) {
//       throw new Error("Failed to generate certificate PDF.");
//     }

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
//     return finalBlob;
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

//   const handleSubmit = async () => {
//     const updatedSubmitted = submittedRides.map((_, idx) => rideActive[idx]);
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
//         (err.response?.data?.detail || err.message)
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
//         <div className="bg-[#fdf6bf] shadow-xl rounded-2xl p-6 mb-8 mt-[-40px]">
//           <div className="flex flex-wrap gap-6 justify-between items-center">
//             <div className="w-full mb-4">
//               <button
//                 type="button"
//                 onClick={handleDownloadReportCard}
//                 className="w-full md:w-fit px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition"
//                 title="Download Chota Cop Report Card"
//               >
//                 Chotacop Card PDF (Optional) ⬇
//               </button>
//             </div>
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
//                   reCAPTCHA site key is missing. Add *VITE_RECAPTCHA_SITE_KEY* in your `.env`.
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
//             <div className="flex flex-col flex-1 min-w-[180px]">
//               {isReturningUser ? (
//                 <input
//                   type="text"
//                   name="school"
//                   value={studentInfo.school}
//                   readOnly
//                   className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
//                 />
//               ) : (
//                 <>
//                   <select
//                     name="school"
//                     value={studentInfo.school}
//                     onChange={handleInputChange}
//                     disabled={!studentInfo.chapter || loadingSchools}
//                     className="w-full border border-gray-300 rounded-lg px-4 py-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                   >
//                     <option value="">
//                       {!studentInfo.chapter 
//                         ? "Select Chapter First" 
//                         : loadingSchools 
//                         ? "Loading Schools..." 
//                         : availableSchools.length === 0
//                         ? "No Schools Available"
//                         : "Select School"}
//                     </option>
//                     {availableSchools.map((school) => (
//                       <option key={school.id} value={school.name}>
//                         {school.name}
//                       </option>
//                     ))}
//                   </select>
//                   {schoolsError && (
//                     <div className="text-xs text-red-600 mt-1">
//                       {schoolsError}
//                     </div>
//                   )}
//                   {loadingSchools && (
//                     <div className="text-xs text-blue-600 mt-1">
//                       Loading schools for {studentInfo.chapter}...
//                     </div>
//                   )}
//                   {studentInfo.chapter && availableSchools.length === 0 && !loadingSchools && !schoolsError && (
//                     <div className="text-xs text-gray-600 mt-1">
//                       No schools found for "{studentInfo.chapter}"
//                     </div>
//                   )}
//                 </>
//               )}
//             </div>
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
//         <div className="overflow-auto hidden md:block">
//           <table className="table-auto w-full border-collapse bg-[#fdf5eb] shadow-xl rounded-2xl overflow-hidden">
//             <thead className="bg-[#fdf6bf]">
//               <tr>
//                 <th className="text-left p-4 text-gray-700">Questions</th>
//                 {Array.from({ length: TOTAL_RIDES }, (_, i) => (
//                   <th key={i} className="text-center p-4 text-gray-700">
//                     <div 
//                       className="flex items-center justify-center gap-2 cursor-pointer" 
//                       onClick={() => handleRideCheckbox(i)}
//                     >
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
//                                 : isAnswered === null
//                                 ? "bg-gray-300"
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
//                                 isAnswered === null
//                                   ? "translate-x-0 opacity-0"
//                                   : isAnswered
//                                   ? "translate-x-full"
//                                   : "translate-x-0"
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
//         <div className="md:hidden overflow-x-auto">
//           <table className="table-auto w-full border-collapse bg-[#fdf5eb] shadow-xl rounded-2xl overflow-hidden">
//             <thead className="bg-[#fdf6bf]">
//               <tr>
//                 <th className="text-left p-4 text-gray-700">Questions</th>
//                 {Array.from({ length: TOTAL_RIDES }, (_, i) => (
//                   <th key={i} className="text-center p-4 text-gray-700 min-w-[120px]">
//                     <div 
//                       className="flex items-center justify-center gap-2 cursor-pointer" 
//                       onClick={() => handleRideCheckbox(i)}
//                     >
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
//                                 : isAnswered === null
//                                 ? "bg-gray-300"
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
//                                 isAnswered === null
//                                   ? "translate-x-0 opacity-0"
//                                   : isAnswered
//                                   ? "translate-x-full"
//                                   : "translate-x-0"
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
//         <ImageUploader />
//         <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
//           <button
//             onClick={handleSubmit}
//             disabled={!isStudentInfoComplete || submitted || !rideActive[0]}
//             className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {submitted ? "Submitted ✓" : "Submit Answers"}
//           </button>
//           <div className="relative">
//             <button
//               onClick={handleDownloadCertificate}
//               onMouseEnter={() => setShowCertTooltip(true)}
//               onMouseLeave={() => setShowCertTooltip(false)}
//               disabled={!(rideActive.slice(0, 5).every(Boolean) && submitted)}
//               className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               Get Certificate 📜
//             </button>
//             {showCertTooltip && (
//               <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg whitespace-nowrap z-10">
//                 Complete 5+ rides and submit to get certificate
//                 <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
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
import ImageUploader from "../components/Image_Uploader";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Ex_Zone from "../components/Ex_Zone";
import axios from "axios";
import Popup from "../components/Popup";
import ReCAPTCHA from "react-google-recaptcha";

// Directly hardcode your reCAPTCHA site key here
// This is safe because site keys are meant to be public
const SITE_KEY = "6LcndMArAAAAAKZ824ZrhdwmU_Z-snsRo5UQPnCQ";

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
const parentQuestionsCount = 2;
const FIVE_MB = 5 * 1024 * 1024;

const QuestionTogglePage = () => {
  const [ridesAnswers, setRidesAnswers] = useState(
    Array(TOTAL_RIDES)
      .fill(null)
      .map(() => Array(questions.length).fill(null))
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
  const [availableSchools, setAvailableSchools] = useState([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [schoolsError, setSchoolsError] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const recaptchaRef = useRef(null);

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
        if (idx === 0 || newActive[idx - 1]) {
          newActive[idx] = true;
          // Initialize unanswered questions as "No" (false) when ride is first activated, preserve existing answers
          const newRidesAnswers = [...ridesAnswers];
          newRidesAnswers[idx] = newRidesAnswers[idx].map((answer) => answer === null ? false : answer);
          setRidesAnswers(newRidesAnswers);
          return newActive;
        } else {
          setPopupMessage(
            `Please activate Ride ${idx} before activating Ride ${idx + 1}.`
          );
          setPopupOpen(true);
          return prev;
        }
      } else {
        const anyLaterChecked = newActive.slice(idx + 1).some(Boolean);
        if (anyLaterChecked) {
          setPopupMessage(
            `Please deactivate all rides after Ride ${idx + 1} first.`
          );
          setPopupOpen(true);
          return prev;
        } else {
          newActive[idx] = false;
          const newRidesAnswers = [...ridesAnswers];
          newRidesAnswers[idx] = Array(questions.length).fill(null);
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
    
    const timeoutId = setTimeout(() => {
      if (studentInfo.chapter && !isReturningUser) {
        setStudentInfo(prev => ({ ...prev, school: "" }));
        fetchSchoolsData(studentInfo.chapter);
      } else {
        setAvailableSchools([]);
        setSchoolsError("");
        if (!isReturningUser) {
          setStudentInfo(prev => ({ ...prev, school: "" }));
        }
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [studentInfo.chapter, isReturningUser]);

  const handleCheckEmail = () => {
    const email = studentInfo.email.trim();
    if (!email) {
      setPopupMessage("Please enter an email.");
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
      setIsReturningUser(true);
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
          .map(() => Array(questions.length).fill(null));
        
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
      setIsReturningUser(false);
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

  const buildCertificateDOM = () => {
    const { name, school, class: studentClass, chapter } = studentInfo;
    const tempDiv = document.createElement("div");
    tempDiv.className =
      "relative w-[1123px] h-[794px] bg-white shadow-lg border rounded-lg overflow-hidden";
    tempDiv.style.width = "1123px";
    tempDiv.style.height = "794px";
    tempDiv.innerHTML = `
      <link href="https://fonts.googleapis.com/css2?family=Shrikhand&display=swap" rel="stylesheet">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Shrikhand&display=swap');
        .shrikhand { font-family: 'Shrikhand', cursive; }
        .canvas-sans { font-family: 'Arial', 'Helvetica Neue', Helvetica, 'Canvas Sans', sans-serif; }
      </style>
      <img src="/assets/Certificate Blank.png" 
           alt="Certificate" 
           style="width: 1123px; height: 794px; object-fit: cover; position: absolute; left: 0; top: 0;"/>
      <div class="canvas-sans" style="position: absolute; top: 246px; left: 90px; font-size: 50px; font-weight: bold; color: #F7931E;">
        Congratulations!
      </div>
      <div class="canvas-sans" style="position: absolute; top: 320px; left: 90px; font-size: 24px; color: #888;">
        This is to certify
      </div>
      <div class="shrikhand" style="position: absolute; top: 344px; left: 90px; font-size: 40px; color: #2d1a4a;">
        ${name}
      </div>
      <div class="canvas-sans" style="position: absolute; top: 410px; left: 90px; font-size: 24px; color: #888;">
        of ${school}
      </div>
      <div class="canvas-sans" style="position: absolute; top: 440px; left: 90px; font-size: 24px; color: #888;">
        in class ${studentClass} at ${chapter}
      </div>
      <div className="canvas-sans" style="position: absolute; top: 470px; left: 90px; font-size: 24px; color: #888;">
        has successfully completed
      </div>
      <div className="canvas-sans" style="position: absolute; top: 510px; left: 90px; font-size: 32px; font-weight: bold; color: #222;">
        Yi Chotacop
      </div>
    `;
    return tempDiv;
  };

  const renderPdfAttempt = async (tempDiv, scale, jpegQuality) => {
    const canvas = await html2canvas(tempDiv, { scale, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", jpegQuality);
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1123, 794],
      compress: true,
    });
    pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);
    const blob = pdf.output("blob");
    const sizeBytes = blob.size;
    return { blob, sizeBytes };
  };

  const generateAndDownloadCertificate = async () => {
    const tempDiv = buildCertificateDOM();
    document.body.appendChild(tempDiv);

    await new Promise((r) => setTimeout(r, 350));

    const qualityOptions = [0.85, 0.75, 0.65, 0.55, 0.45];
    const scaleOptions = [2, 1.75, 1.5];

    let finalBlob = null;
    let finalSize = 0;
    let usedQ = null;
    let usedScale = null;

    for (const sc of scaleOptions) {
      for (const q of qualityOptions) {
        try {
          const { blob, sizeBytes } = await renderPdfAttempt(tempDiv, sc, q);
          if (sizeBytes <= FIVE_MB) {
            finalBlob = blob;
            finalSize = sizeBytes;
            usedQ = q;
            usedScale = sc;
            break;
          }
          if (!finalBlob || sizeBytes < finalSize) {
            finalBlob = blob;
            finalSize = sizeBytes;
            usedQ = q;
            usedScale = sc;
          }
        } catch (e) {
          console.error("PDF render attempt failed:", e);
        }
      }
      if (finalBlob && finalSize <= FIVE_MB) break;
    }

    document.body.removeChild(tempDiv);

    if (!finalBlob) {
      throw new Error("Failed to generate certificate PDF.");
    }

    const dlUrl = URL.createObjectURL(finalBlob);
    const a = document.createElement("a");
    a.href = dlUrl;
    a.download = "ChotaCop_Certificate.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(dlUrl);

    console.log(
      `Certificate ready. Size: ${(finalSize / (1024 * 1024)).toFixed(
        2
      )} MB, scale=${usedScale}, quality=${usedQ}`
    );
    return finalBlob;
  };

  const sendCertificateToEmail = async (pdfBlob) => {
    const file = new File([pdfBlob], "ChotaCop_Certificate.pdf", {
      type: "application/pdf",
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", studentInfo.email);

    try {
      await axios.post("https://chotacop.in/api/send-pdf", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      alert(
        "Failed to send certificate to email: " +
          (err.response?.data?.detail || err.message)
      );
    }
  };

  const handleDownloadCertificate = async () => {
    if (!(rideActive.slice(0, 5).every(Boolean) && submitted)) {
      setPopupMessage(
        "Please complete the first five rides and submit before generating the certificate."
      );
      setPopupOpen(true);
      return;
    }
    try {
      const compressedBlob = await generateAndDownloadCertificate();
      await sendCertificateToEmail(compressedBlob);
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
        <div className="bg-[#fdf6bf] shadow-xl rounded-2xl p-6 mb-8 mt-[-40px]">
          <div className="flex flex-wrap gap-6 justify-between items-center">
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
              {showCaptcha && (
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={SITE_KEY}
                  onChange={handleCaptchaComplete}
                  onExpired={handleCaptchaExpired}
                  onErrored={handleCaptchaErrored}
                />
              )}
            </div>
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
              {isReturningUser ? (
                <input
                  type="text"
                  name="school"
                  value={studentInfo.school}
                  readOnly
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed"
                />
              ) : (
                <>
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
                </>
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
        <div className="overflow-auto hidden md:block">
          <table className="table-auto w-full border-collapse bg-[#fdf5eb] shadow-xl rounded-2xl overflow-hidden">
            <thead className="bg-[#fdf6bf]">
              <tr>
                <th className="text-left p-4 text-gray-700">Questions</th>
                {Array.from({ length: TOTAL_RIDES }, (_, i) => (
                  <th key={i} className="text-center p-4 text-gray-700">
                    <div 
                      className="flex items-center justify-center gap-2 cursor-pointer" 
                      onClick={() => handleRideCheckbox(i)}
                    >
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
                                : isAnswered === null
                                ? "bg-gray-300"
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
                                isAnswered === null
                                  ? "translate-x-0 opacity-0"
                                  : isAnswered
                                  ? "translate-x-full"
                                  : "translate-x-0"
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
        <div className="md:hidden overflow-x-auto">
          <table className="table-auto w-full border-collapse bg-[#fdf5eb] shadow-xl rounded-2xl overflow-hidden">
            <thead className="bg-[#fdf6bf]">
              <tr>
                <th className="text-left p-4 text-gray-700">Questions</th>
                {Array.from({ length: TOTAL_RIDES }, (_, i) => (
                  <th key={i} className="text-center p-4 text-gray-700 min-w-[120px]">
                    <div 
                      className="flex items-center justify-center gap-2 cursor-pointer" 
                      onClick={() => handleRideCheckbox(i)}
                    >
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
                                : isAnswered === null
                                ? "bg-gray-300"
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
                                isAnswered === null
                                  ? "translate-x-0 opacity-0"
                                  : isAnswered
                                  ? "translate-x-full"
                                  : "translate-x-0"
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
        <Ex_Zone
          answers={experienceAnswers}
          setAnswers={setExperienceAnswers}
          parentAnswers={parentZoneAnswers}
          setParentAnswers={setParentZoneAnswers}
          disabled={!rideActive.slice(0, 5).every(Boolean)}
          onPopup={(msg) => {
            setPopupMessage(msg);
            setPopupOpen(true);
          }}
        />
        <ImageUploader />
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleSubmit}
            disabled={!isStudentInfoComplete || submitted || !rideActive[0]}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitted ? "Submitted ✓" : "Submit Answers"}
          </button>
          <div className="relative">
            <button
              onClick={handleDownloadCertificate}
              onMouseEnter={() => setShowCertTooltip(true)}
              onMouseLeave={() => setShowCertTooltip(false)}
              disabled={!(rideActive.slice(0, 5).every(Boolean) && submitted)}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  );
};

export default QuestionTogglePage;