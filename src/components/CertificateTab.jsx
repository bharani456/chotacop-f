// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import html2canvas from "html2canvas";
// import jsPDF from "jspdf";

// const CERTIFICATE_API_ENDPOINT = "https://chotacop.in/api/certificate-data";
// const SEND_PDF_API_ENDPOINT = "https://chotacop.in/api/send-pdf"; // Update this if the server endpoint is different
// const FIVE_MB = 5 * 1024 * 1024; // 5MB in bytes

// const CertificateTab = ({
//   selectedChapter,
//   setSelectedChapter,
//   selectedSchool,
//   setSelectedSchool
// }) => {
//   const [certificateData, setCertificateData] = useState(null);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [userId, setUserId] = useState("");
//   const [availableSchools, setAvailableSchools] = useState([]);
//   const [generatingCertificate, setGeneratingCertificate] = useState(null); // Track which certificate is being generated

//   // Get user ID from localStorage
//   useEffect(() => {
//     const userData = localStorage.getItem("user");
//     try {
//       if (userData) {
//         const parsed = JSON.parse(userData);
//         const user_id = parsed?.userId;
//         if (user_id) {
//           setUserId(user_id);
//         } else {
//           console.warn("User data found in local storage but no userId.");
//           setError("User ID not found. Please sign in again.");
//         }
//       } else {
//         setError("Please sign in first.");
//       }
//     } catch (error) {
//       console.error("Failed to parse user data:", error);
//       setError("Error reading user data. Please sign in again.");
//     }
//   }, []);

//   // Fetch certificate data when userId is available
//   useEffect(() => {
//     if (userId) {
//       fetchCertificateData();
//     }
//   }, [userId]);

//   // Fetch certificate data from API
//   const fetchCertificateData = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await axios.post(CERTIFICATE_API_ENDPOINT, {
//         user_id: userId
//       });

//       if (response.data) {
//         setCertificateData(response.data);

//         // Auto-select first chapter if available
//         if (response.data.chapters && Object.keys(response.data.chapters).length > 0 && !selectedChapter) {
//           const firstChapter = Object.keys(response.data.chapters)[0];
//           setSelectedChapter(firstChapter);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching certificate data:", error);
//       setError("Failed to fetch certificate data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update available schools when chapter changes
//   useEffect(() => {
//     if (certificateData?.chapters && selectedChapter) {
//       const chapterStudents = certificateData.chapters[selectedChapter] || [];
//       const uniqueSchools = [...new Set(chapterStudents.map((student) => student.school))];
//       const schoolsList = uniqueSchools.length > 0 ? ["All Schools", ...uniqueSchools.sort()] : [];
//       setAvailableSchools(schoolsList);

//       // Auto-select "All Schools" when chapter changes
//       if (schoolsList.length > 0) {
//         setSelectedSchool("All Schools");
//       } else {
//         setSelectedSchool("");
//       }
//     } else {
//       setAvailableSchools([]);
//       setSelectedSchool("");
//     }
//   }, [certificateData, selectedChapter, setSelectedSchool]);

//   // Filter students based on selected chapter and school
//   useEffect(() => {
//     if (!certificateData || !certificateData.chapters) {
//       setFilteredStudents([]);
//       return;
//     }

//     let students = [];

//     // Get students for selected chapter
//     if (selectedChapter && certificateData.chapters[selectedChapter]) {
//       students = certificateData.chapters[selectedChapter];

//       // Filter by school if not "All Schools"
//       if (selectedSchool && selectedSchool !== "All Schools") {
//         students = students.filter((student) => student.school === selectedSchool);
//       }
//     }

//     setFilteredStudents(students);
//   }, [certificateData, selectedChapter, selectedSchool]);

//   // Handle chapter change
//   const handleChapterChange = (e) => {
//     const newChapter = e.target.value;
//     setSelectedChapter(newChapter);
//   };

//   // Handle school change
//   const handleSchoolChange = (e) => {
//     setSelectedSchool(e.target.value);
//   };

//   // Validate email format
//   const isValidEmail = (email) => {
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   // Build certificate DOM element
//   const buildCertificateDOM = (student) => {
//     const { name, school, class: studentClass, chapter } = student;
//     const tempDiv = document.createElement("div");
//     tempDiv.className =
//       "relative w-[1123px] h-[794px] bg-[#fdf5eb] shadow-lg border rounded-lg overflow-hidden";
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

//   /** Try rendering PDF at scale + JPEG quality */
//   const renderPdfAttempt = async (tempDiv, scale, jpegQuality) => {
//     const canvas = await html2canvas(tempDiv, { scale, useCORS: true });
//     const imgData = canvas.toDataURL("image/jpeg", jpegQuality);

//     const pdf = new jsPDF({
//       orientation: "landscape",
//       unit: "px",
//       format: [1123, 794],
//       compress: true
//     });
//     pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);

//     const blob = pdf.output("blob");
//     const sizeBytes = blob.size;
//     return { blob, sizeBytes };
//   };

//   /** Generate compressed PDF */
//   const generateAndDownloadCertificate = async (student) => {
//     const tempDiv = buildCertificateDOM(student);
//     document.body.appendChild(tempDiv);

//     await new Promise((r) => setTimeout(r, 350));

//     const qualityOptions = [0.85, 0.75, 0.65, 0.55, 0.45];
//     const scaleOptions = [2, 1.75, 1.5];

//     let finalBlob = null;
//     let finalSize = 0;

//     for (const sc of scaleOptions) {
//       for (const q of qualityOptions) {
//         try {
//           const { blob, sizeBytes } = await renderPdfAttempt(tempDiv, sc, q);
//           if (sizeBytes <= FIVE_MB) {
//             finalBlob = blob;
//             finalSize = sizeBytes;
//             break;
//           }
//           if (!finalBlob || sizeBytes < finalSize) {
//             finalBlob = blob;
//             finalSize = sizeBytes;
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

//     const fileName = `ChotaCop_Certificate_${student.name.replace(/\s+/g, "_")}.pdf`;
//     const dlUrl = URL.createObjectURL(finalBlob);
//     const a = document.createElement("a");
//     a.href = dlUrl;
//     a.download = fileName;
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     URL.revokeObjectURL(dlUrl);

//     return finalBlob;
//   };

//   const sendCertificateToEmail = async (pdfBlob, student) => {
//     // Validate email
//     if (!student.email || !isValidEmail(student.email)) {
//       console.error(`Invalid email address for ${student.name}: ${student.email}`);
//       alert(`Invalid email address for ${student.name}. Certificate downloaded but not emailed.`);
//       return false;
//     }

//     const file = new File([pdfBlob], `ChotaCop_Certificate_${student.name.replace(/\s+/g, "_")}.pdf`, {
//       type: "application/pdf"
//     });
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("email", student.email);

//     try {
//       const response = await axios.post(SEND_PDF_API_ENDPOINT, formData, {
//         headers: { "Content-Type": "multipart/form-data" }
//       });
//       console.log(`Certificate sent to ${student.email}:`, response.data);
//       return true;
//     } catch (err) {
//       console.error(`Failed to send certificate to ${student.email}:`, err);
//       let errorMessage = "Unknown error occurred.";
//       if (err.response) {
//         if (err.response.status === 404) {
//           errorMessage = "Email sending endpoint not found (404). Please check the server configuration.";
//         } else {
//           errorMessage = err.response.data?.detail || err.message;
//         }
//       } else if (err.request) {
//         errorMessage = "No response received from the server. Check your network or server status.";
//       } else {
//         errorMessage = err.message;
//       }
//       alert(`Failed to send certificate to ${student.email}: ${errorMessage}`);
//       return false;
//     }
//   };

//   const handleDownloadCertificate = async (student) => {
//     const studentKey = `${student.email}-${student.name}`;
//     setGeneratingCertificate(studentKey);

//     try {
//       const compressedBlob = await generateAndDownloadCertificate(student);
//       const emailSent = await sendCertificateToEmail(compressedBlob, student);

//       if (emailSent) {
//         alert(`Certificate generated and sent to ${student.email} successfully!`);
//       } else {
//         alert(`Certificate downloaded successfully for ${student.name}, but email sending failed.`);
//       }
//     } catch (e) {
//       console.error("Error generating/sending certificate:", e);
//       alert(`Could not generate/send certificate for ${student.name}. Please try again.`);
//     } finally {
//       setGeneratingCertificate(null);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-gray-600">Loading certificate data...</div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="text-red-600">{error}</div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6">
//       {/* Chapter and School Selectors */}
//       <div className="flex gap-4 mb-6">
//         {/* Chapter Selector */}
//         <div className="flex-1">
//           <label className="block text-sm font-medium mb-1">Chapter</label>
//           {certificateData?.chapter === "ALL_Chapter" ? (
//             <select
//               className="p-2 border rounded-lg w-full"
//               value={selectedChapter || ""}
//               onChange={handleChapterChange}
//               disabled={
//                 !certificateData?.chapters ||
//                 Object.keys(certificateData.chapters).length === 0
//               }
//             >
//               <option value="">Select a chapter</option>
//               {certificateData?.chapters &&
//                 Object.keys(certificateData.chapters)
//                   .sort()
//                   .map((chapterName) => (
//                     <option key={chapterName} value={chapterName}>
//                       {chapterName}
//                     </option>
//                   ))}
//             </select>
//           ) : (
//             <input
//               className="p-2 border rounded-lg w-full bg-gray-100 text-gray-700"
//               value={selectedChapter || "Loading chapter..."}
//               readOnly
//               disabled
//             />
//           )}
//         </div>

//         {/* School Selector */}
//         <div className="flex-1">
//           <label className="block text-sm font-medium mb-1">School</label>
//           <select
//             className="p-2 border rounded-lg w-full"
//             value={selectedSchool || ""}
//             onChange={handleSchoolChange}
//             disabled={!selectedChapter || availableSchools.length === 0}
//           >
//             <option value="">Select a school</option>
//             {availableSchools.map((school) => (
//               <option key={school} value={school}>
//                 {school}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Certificate Table */}
//       <div className="shadow-md rounded-lg overflow-hidden border border-gray-200">
//         {/* Table Header */}
//         <div className="grid grid-cols-4 bg-gray-100 border-b border-gray-300">
//           <div className="p-3 font-semibold text-center text-gray-700">Name</div>
//           <div className="p-3 font-semibold text-center text-gray-700">Email</div>
//           <div className="p-3 font-semibold text-center text-gray-700">School</div>
//           <div className="p-3 font-semibold text-center text-gray-700">Certificates</div>
//         </div>

//         {/* Table Body */}
//         <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
//           {filteredStudents.length > 0 ? (
//             <div className="divide-y divide-gray-200">
//               {filteredStudents.map((student, index) => {
//                 const studentKey = `${student.email}-${student.name}`;
//                 const isGenerating = generatingCertificate === studentKey;

//                 return (
//                   <div
//                     key={`${student.email}-${index}`}
//                     className="grid grid-cols-4 hover:bg-gray-50 transition"
//                   >
//                     {/* Name */}
//                     <div className="p-3 flex items-center justify-center text-sm text-gray-800">
//                       {student.name}
//                     </div>

//                     {/* Email */}
//                     <div className="p-3 flex items-center justify-center text-sm text-gray-800 break-all">
//                       {student.email}
//                     </div>

//                     {/* School */}
//                     <div className="p-3 flex items-center justify-center text-sm text-gray-800">
//                       {student.school}
//                     </div>

//                     {/* Certificate Button */}
//                     <div className="p-3 flex items-center justify-center">
//                       <button
//                         onClick={() => handleDownloadCertificate(student)}
//                         disabled={isGenerating}
//                         className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
//                           isGenerating
//                             ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                             : "bg-white border-gray-400 hover:bg-gray-100 text-gray-700"
//                         }`}
//                       >
//                         {isGenerating ? "Generating..." : "Download"}
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="flex items-center justify-center h-[300px] text-gray-500">
//               {!selectedChapter
//                 ? "Please select a chapter to view certificates"
//                 : !selectedSchool
//                 ? "Please select a school to view certificates"
//                 : "No students found for the selected criteria"}
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Summary Info */}
//       {filteredStudents.length > 0 && (
//         <div className="mt-4 text-sm text-gray-600">
//           Showing {filteredStudents.length} student
//           {filteredStudents.length !== 1 ? "s" : ""}
//           {selectedChapter && ` from ${selectedChapter}`}
//           {selectedSchool && selectedSchool !== "All Schools" && ` - ${selectedSchool}`}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CertificateTab;






import React, { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const CERTIFICATE_API_ENDPOINT = "https://chotacop.in/api/certificate-data";
const SEND_PDF_API_ENDPOINT = "https://chotacop.in/api/send-pdf"; // Update this if the server endpoint is different
const FIVE_MB = 5 * 1024 * 1024; // 5MB in bytes

const CertificateTab = ({
  selectedChapter,
  setSelectedChapter,
  selectedSchool,
  setSelectedSchool
}) => {
  const [certificateData, setCertificateData] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");
  const [availableSchools, setAvailableSchools] = useState([]);
  const [generatingCertificate, setGeneratingCertificate] = useState(null); // Track which certificate is being generated

  // Get user ID from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    try {
      if (userData) {
        const parsed = JSON.parse(userData);
        const user_id = parsed?.userId;
        if (user_id) {
          setUserId(user_id);
        } else {
          console.warn("User data found in local storage but no userId.");
          setError("User ID not found. Please sign in again.");
        }
      } else {
        setError("Please sign in first.");
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      setError("Error reading user data. Please sign in again.");
    }
  }, []);

  // Fetch certificate data when userId is available
  useEffect(() => {
    if (userId) {
      fetchCertificateData();
    }
  }, [userId]);

  // Fetch certificate data from API
  const fetchCertificateData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(CERTIFICATE_API_ENDPOINT, {
        user_id: userId
      });

      if (response.data) {
        setCertificateData(response.data);

        // Auto-select first chapter if available
        if (
          response.data.chapters &&
          Object.keys(response.data.chapters).length > 0 &&
          !selectedChapter
        ) {
          const firstChapter = Object.keys(response.data.chapters)[0];
          setSelectedChapter(firstChapter);
        }
      }
    } catch (error) {
      console.error("Error fetching certificate data:", error);
      setError("Failed to fetch certificate data.");
    } finally {
      setLoading(false);
    }
  };

  // Update available schools when chapter changes
  useEffect(() => {
    if (certificateData?.chapters && selectedChapter) {
      const chapterStudents = certificateData.chapters[selectedChapter] || [];
      const uniqueSchools = [
        ...new Set(chapterStudents.map((student) => student.school))
      ];
      const schoolsList =
        uniqueSchools.length > 0
          ? ["All Schools", ...uniqueSchools.sort()]
          : [];
      setAvailableSchools(schoolsList);

      // Auto-select "All Schools" when chapter changes
      if (schoolsList.length > 0) {
        setSelectedSchool("All Schools");
      } else {
        setSelectedSchool("");
      }
    } else {
      setAvailableSchools([]);
      setSelectedSchool("");
    }
  }, [certificateData, selectedChapter, setSelectedSchool]);

  // Filter students based on selected chapter and school
  useEffect(() => {
    if (!certificateData || !certificateData.chapters) {
      setFilteredStudents([]);
      return;
    }

    let students = [];

    // Get students for selected chapter
    if (selectedChapter && certificateData.chapters[selectedChapter]) {
      students = certificateData.chapters[selectedChapter];

      // Filter by school if not "All Schools"
      if (selectedSchool && selectedSchool !== "All Schools") {
        students = students.filter(
          (student) => student.school === selectedSchool
        );
      }
    }

    setFilteredStudents(students);
  }, [certificateData, selectedChapter, selectedSchool]);

  // Handle chapter change
  const handleChapterChange = (e) => {
    const newChapter = e.target.value;
    setSelectedChapter(newChapter);
  };

  // Handle school change
  const handleSchoolChange = (e) => {
    setSelectedSchool(e.target.value);
  };

  // Validate email format
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Build certificate DOM element
  const buildCertificateDOM = (student) => {
    const { name, school, class: studentClass, chapter } = student;
    const tempDiv = document.createElement("div");
    tempDiv.className =
      "relative w-[1123px] h-[794px] bg-[#fdf5eb] shadow-lg border rounded-lg overflow-hidden";
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
      <div class="canvas-sans" style="position: absolute; top: 470px; left: 90px; font-size: 24px; color: #888;">
        has successfully completed
      </div>
      <div class="canvas-sans" style="position: absolute; top: 510px; left: 90px; font-size: 32px; font-weight: bold; color: #222;">
        Yi Chotacop
      </div>
    `;
    return tempDiv;
  };

  /** Try rendering PDF at scale + JPEG quality */
  const renderPdfAttempt = async (tempDiv, scale, jpegQuality) => {
    const canvas = await html2canvas(tempDiv, { scale, useCORS: true });
    const imgData = canvas.toDataURL("image/jpeg", jpegQuality);

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1123, 794],
      compress: true
    });
    pdf.addImage(imgData, "JPEG", 0, 0, 1123, 794);

    const blob = pdf.output("blob");
    const sizeBytes = blob.size;
    return { blob, sizeBytes };
  };

  /** Generate compressed PDF */
  const generateAndDownloadCertificate = async (student) => {
    const tempDiv = buildCertificateDOM(student);
    document.body.appendChild(tempDiv);

    await new Promise((r) => setTimeout(r, 350));

    const qualityOptions = [0.85, 0.75, 0.65, 0.55, 0.45];
    const scaleOptions = [2, 1.75, 1.5];

    let finalBlob = null;
    let finalSize = 0;

    for (const sc of scaleOptions) {
      for (const q of qualityOptions) {
        try {
          const { blob, sizeBytes } = await renderPdfAttempt(tempDiv, sc, q);
          if (sizeBytes <= FIVE_MB) {
            finalBlob = blob;
            finalSize = sizeBytes;
            break;
          }
          if (!finalBlob || sizeBytes < finalSize) {
            finalBlob = blob;
            finalSize = sizeBytes;
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

    const fileName = `ChotaCop_Certificate_${student.name.replace(/\s+/g, "_")}.pdf`;
    const dlUrl = URL.createObjectURL(finalBlob);
    const a = document.createElement("a");
    a.href = dlUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(dlUrl);

    return finalBlob;
  };

  const sendCertificateToEmail = async (pdfBlob, student) => {
    if (!student.email || !isValidEmail(student.email)) {
      console.error(
        `Invalid email address for ${student.name}: ${student.email}`
      );
      alert(
        `Invalid email address for ${student.name}. Certificate downloaded but not emailed.`
      );
      return false;
    }

    const file = new File(
      [pdfBlob],
      `ChotaCop_Certificate_${student.name.replace(/\s+/g, "_")}.pdf`,
      {
        type: "application/pdf"
      }
    );
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", student.email);

    try {
      const response = await axios.post(SEND_PDF_API_ENDPOINT, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log(`Certificate sent to ${student.email}:`, response.data);
      return true;
    } catch (err) {
      console.error(`Failed to send certificate to ${student.email}:`, err);
      let errorMessage = "Unknown error occurred.";
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage =
            "Email sending endpoint not found (404). Please check the server configuration.";
        } else {
          errorMessage = err.response.data?.detail || err.message;
        }
      } else if (err.request) {
        errorMessage =
          "No response received from the server. Check your network or server status.";
      } else {
        errorMessage = err.message;
      }
      alert(`Failed to send certificate to ${student.email}: ${errorMessage}`);
      return false;
    }
  };

  const handleDownloadCertificate = async (student) => {
    const studentKey = `${student.email}-${student.name}`;
    setGeneratingCertificate(studentKey);

    try {
      const compressedBlob = await generateAndDownloadCertificate(student);
      const emailSent = await sendCertificateToEmail(compressedBlob, student);

      if (emailSent) {
        alert(
          `Certificate generated and sent to ${student.email} successfully!`
        );
      } else {
        alert(
          `Certificate downloaded successfully for ${student.name}, but email sending failed.`
        );
      }
    } catch (e) {
      console.error("Error generating/sending certificate:", e);
      alert(
        `Could not generate/send certificate for ${student.name}. Please try again.`
      );
    } finally {
      setGeneratingCertificate(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Loading certificate data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Chapter and School Selectors */}
      <div className="flex gap-4 mb-6">
        {/* Chapter Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Chapter</label>
          {certificateData?.chapter === "ALL_Chapter" ? (
            <select
              className="p-2 border rounded-lg w-full"
              value={selectedChapter || ""}
              onChange={handleChapterChange}
              disabled={
                !certificateData?.chapters ||
                Object.keys(certificateData.chapters).length === 0
              }
            >
              <option value="">Select a chapter</option>
              {certificateData?.chapters &&
                Object.keys(certificateData.chapters)
                  .sort()
                  .map((chapterName) => (
                    <option key={chapterName} value={chapterName}>
                      {chapterName}
                    </option>
                  ))}
            </select>
          ) : (
            <input
              className="p-2 border rounded-lg w-full bg-gray-100 text-gray-700"
              value={selectedChapter || "Loading chapter..."}
              readOnly
              disabled
            />
          )}
        </div>

        {/* School Selector */}
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">School</label>
          <select
            className="p-2 border rounded-lg w-full"
            value={selectedSchool || ""}
            onChange={handleSchoolChange}
            disabled={!selectedChapter || availableSchools.length === 0}
          >
            <option value="">Select a school</option>
            {availableSchools.map((school) => (
              <option key={school} value={school}>
                {school}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Certificate Table */}
      <div className="shadow-md rounded-lg overflow-hidden border border-gray-200">
        {/* Table Header */}
        <div className="grid grid-cols-5 bg-gray-100 border-b border-gray-300">
          <div className="p-3 font-semibold text-center text-gray-700">S.No</div>
          <div className="p-3 font-semibold text-center text-gray-700">Name</div>
          <div className="p-3 font-semibold text-center text-gray-700">Email</div>
          <div className="p-3 font-semibold text-center text-gray-700">School</div>
          <div className="p-3 font-semibold text-center text-gray-700">
            Certificates
          </div>
        </div>

        {/* Table Body */}
        <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
          {filteredStudents.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {filteredStudents.map((student, index) => {
                const studentKey = `${student.email}-${student.name}`;
                const isGenerating = generatingCertificate === studentKey;

                return (
                  <div
                    key={`${student.email}-${index}`}
                    className="grid grid-cols-5 hover:bg-gray-50 transition"
                  >
                    {/* S.No */}
                    <div className="p-3 flex items-center justify-center text-sm text-gray-800">
                      {index + 1}
                    </div>

                    {/* Name */}
                    <div className="p-3 flex items-center justify-center text-sm text-gray-800">
                      {student.name}
                    </div>

                    {/* Email */}
                    <div className="p-3 flex items-center justify-center text-sm text-gray-800 break-all">
                      {student.email}
                    </div>

                    {/* School */}
                    <div className="p-3 flex items-center justify-center text-sm text-gray-800">
                      {student.school}
                    </div>

                    {/* Certificate Button */}
                    <div className="p-3 flex items-center justify-center">
                      <button
                        onClick={() => handleDownloadCertificate(student)}
                        disabled={isGenerating}
                        className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                          isGenerating
                            ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                            : "bg-white border-gray-400 hover:bg-gray-100 text-gray-700"
                        }`}
                      >
                        {isGenerating ? "Generating..." : "Download"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              {!selectedChapter
                ? "Please select a chapter to view certificates"
                : !selectedSchool
                ? "Please select a school to view certificates"
                : "No students found for the selected criteria"}
            </div>
          )}
        </div>
      </div>

      {/* Summary Info */}
      {filteredStudents.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredStudents.length} student
          {filteredStudents.length !== 1 ? "s" : ""}
          {selectedChapter && ` from ${selectedChapter}`}
          {selectedSchool &&
            selectedSchool !== "All Schools" &&
            ` - ${selectedSchool}`}
        </div>
      )}
    </div>
  );
};

export default CertificateTab;
