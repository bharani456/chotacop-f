// import React, { useState, useEffect } from "react";
// import Header from "../components/Header";

// const AddSchools = () => {
//   const [adminChapter, setAdminChapter] = useState("");
//   const [chapterName, setChapterName] = useState("");
//   const [schoolName, setSchoolName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const [messageType, setMessageType] = useState(""); // 'success' or 'error'
//   const [isAllChapter, setIsAllChapter] = useState(false);
//   const [adminLoading, setAdminLoading] = useState(true);

//   useEffect(() => {
//     // Get admin chapter details from localStorage (set during login from users.json)
//     const fetchAdminDetails = async () => {
//       try {
//         // DEBUGGING: Check what's in localStorage
//         console.log("🔍 All localStorage keys:", Object.keys(localStorage));
//         console.log("🔍 Raw localStorage user:", localStorage.getItem('user')); // Changed from 'adminData' to 'user'
//         console.log("🔍 Raw localStorage adminData:", localStorage.getItem('adminData'));
        
//         // Get admin data stored during login (from users.json)
//         // Try 'user' key first, then fall back to 'adminData'
//         const userData = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('adminData')) || {};
//         const chapter = userData.chapter;
        
//         console.log("🔍 Parsed userData object:", userData);
//         console.log("🔍 Retrieved admin chapter:", chapter);
//         console.log("🔍 Chapter type:", typeof chapter);
//         console.log("🔍 Chapter length:", chapter?.length);
        
//         if (!chapter) {
//           console.error("❌ No chapter found in adminData");
//           setMessage("Admin chapter not found. Please login again.");
//           setMessageType("error");
//           setAdminLoading(false);
//           return;
//         }
        
//         setAdminChapter(chapter);
        
//         // Check if admin has ALL_Chapter permissions (exact match)
//         // ONLY "ALL_Chapter" gets dropdown, ANY other chapter (Chennai, Madurai, etc.) does NOT
//         const isAllChapterAdmin = chapter === "ALL_Chapter";
//         console.log("🔍 Checking chapter === 'ALL_Chapter':", "${chapter}" === "ALL_Chapter");
//         console.log("🔍 Is All Chapter Admin:", isAllChapterAdmin);
        
//         setIsAllChapter(isAllChapterAdmin);
        
//         // For ALL specific chapter admins (Chennai, Madurai, Coimbatore, etc.), pre-set their chapter
//         if (!isAllChapterAdmin) {
//           setChapterName(chapter); // Pre-fill with admin's specific chapter (no dropdown)
//           console.log("🔍 Set chapterName to:", chapter);
//         } else {
//           console.log("🔍 ALL_Chapter admin - dropdown will be shown");
//         }
        
//         console.log("✅ Final state - isAllChapter:", isAllChapterAdmin, "adminChapter:", chapter);
        
//       } catch (error) {
//         console.error("❌ Error fetching admin details:", error);
//         setMessage("Error fetching admin details. Please login again.");
//         setMessageType("error");
//       } finally {
//         setAdminLoading(false);
//       }
//     };

//     fetchAdminDetails();
//   }, []);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     // Validation
//     if (!schoolName.trim()) {
//       setMessage("School name is required");
//       setMessageType("error");
//       setLoading(false);
//       return;
//     }

//     // For ALL_Chapter admins, chapter selection is required
//     if (isAllChapter && !chapterName.trim()) {
//       setMessage("Please select a chapter");
//       setMessageType("error");
//       setLoading(false);
//       return;
//     }

//     try {
//       const requestBody = {
//         // For ALL_Chapter admins: use selected chapter
//         // For specific chapter admins: use their fixed chapter
//         chapter: isAllChapter ? chapterName.trim() : adminChapter,
//         school: schoolName.trim(),
//         adminChapter: adminChapter, // Track which admin added this school
//         addedBy: JSON.parse(localStorage.getItem('user'))?.email || JSON.parse(localStorage.getItem('adminData'))?.email || 'Unknown'
//       };

//       console.log("Adding school with data:", requestBody);

//       const response = await fetch("https://chotacop.in/api/add-school", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           // Add authorization header if you have tokens
//           // "Authorization": Bearer ${localStorage.getItem('token')}
//         },
//         body: JSON.stringify(requestBody),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to add school: ${errorText}`);
//       }

//       const result = await response.json();
//       console.log("School added successfully:", result);

//       setMessage(`School "${schoolName}" added successfully to ${isAllChapter ? chapterName : adminChapter} chapter!`);
//       setMessageType("success");
      
//       // Reset form
//       setSchoolName("");
//       // Only reset chapter name for ALL_Chapter admins
//       if (isAllChapter) {
//         setChapterName("");
//       }

//     } catch (error) {
//       console.error("Error adding school:", error);
//       setMessage(`Error adding school: ${error.message}`);
//       setMessageType("error");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show loading state while fetching admin details
//   if (adminLoading) {
//     return (
//       <div className="flex flex-col min-h-screen bg-orange-50">
//         <Header />
//         <div className="flex-grow flex items-center justify-center">
//           <div className="text-center">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
//             <p className="mt-4 text-gray-600">Loading admin details...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Show error state if admin chapter couldn't be loaded
//   if (!adminChapter && message && messageType === "error") {
//     return (
//       <div className="flex flex-col min-h-screen bg-orange-50">
//         <Header />
//         <div className="flex-grow flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
//             <div className="text-red-600 mb-4">
//               <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//             </div>
//             <h2 className="text-xl font-bold text-gray-800 mb-2">Access Error</h2>
//             <p className="text-red-600 mb-4">{message}</p>
//             <button 
//               onClick={() => window.location.href = '/login'}
//               className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
//             >
//               Go to Login
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col min-h-screen bg-orange-50">
//       <Header />
//       <div className="flex-grow flex items-center justify-center p-4">
//         <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
//           <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
//             Add New School
//           </h2>
          
//           {/* Debug Info - Remove this in production */}
          

//           {/* Admin Info Display */}
//           <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
//             <div className="flex items-center mb-2">
//               <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
//               <span className="text-sm font-semibold text-blue-800">Admin Details</span>
//             </div>
//             <p className="text-sm text-blue-700">
//               <span className="font-medium">Type:</span> {
//                 isAllChapter ? "Super Admin" : "Chapter Admin"
//               }
//             </p>
//             <p className="text-sm text-blue-700">
//               <span className="font-medium">Chapter:</span> {adminChapter}
//             </p>
//             {!isAllChapter && (
//               <p className="text-xs text-blue-600 mt-2 bg-blue-100 p-2 rounded">
//                 ℹ Schools will be automatically added to <span className="font-semibold">{adminChapter}</span> chapter (no chapter selection needed)
//               </p>
//             )}
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-4">
//             {/* Chapter Selection - ONLY for ALL_Chapter admins */}
//             {isAllChapter && (
//               <div>
//                 <label htmlFor="chapterName" className="block text-sm font-medium text-gray-700 mb-2">
//                   Select Chapter *
//                 </label>
//                 <input
//                   type="text"
//                   id="chapterName"
//                   value={chapterName}
//                   onChange={(e) => setChapterName(e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                   placeholder="Enter chapter name (e.g., Chennai, Madurai, Coimbatore)"
//                   required
//                 />
//                 <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
//                   💡 <strong>Super Admin Privilege:</strong> Only ALL_Chapter admins can select chapters. All other admins are restricted to their assigned chapter.
//                 </div>
//               </div>
//             )}

//             {/* Chapter Display - For specific chapter admins */}
//             {!isAllChapter && (
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Target Chapter
//                 </label>
//                 <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
//                   {adminChapter}
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">
//                   This school will be added to your assigned chapter
//                 </p>
//               </div>
//             )}

//             {/* School Name Input */}
//             <div>
//               <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
//                 School Name *
//               </label>
//               <input
//                 type="text"
//                 id="schoolName"
//                 value={schoolName}
//                 onChange={(e) => setSchoolName(e.target.value)}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
//                 placeholder="Enter complete school name"
//                 required
//               />
//             </div>

//             {/* Submit Button */}
//             <button
//   type="submit"
//   disabled={loading}
//   className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
//     loading
//       ? "bg-gray-400 cursor-not-allowed text-gray-400" // disabled state
//       : "bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 shadow-lg hover:shadow-xl" // active state
//   }`}
// >
//   {loading ? (
//     <div className="flex items-center justify-center">
//       <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//       Adding School...
//     </div>
//   ) : (
//     "Add School"
//   )}
// </button>

//           </form>

//           {/* Message Display */}
//           {message && messageType && (
//             <div
//               className={`mt-4 p-3 rounded-lg text-sm animate-fade-in ${
//                 messageType === "success"
//                   ? "bg-green-100 text-green-800 border border-green-300"
//                   : "bg-red-100 text-red-800 border border-red-300"
//               }`}
//             >
//               <div className="flex items-center">
//                 {messageType === "success" ? (
//                   <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
//                   </svg>
//                 ) : (
//                   <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//                   </svg>
//                 )}
//                 {message}
//               </div>
//             </div>
//           )}

//           {/* Instructions */}
//           <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
//             <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
//               <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
//               </svg>
//               Instructions
//             </h3>
//             <ul className="text-xs text-gray-600 space-y-2">
//               <li className="flex items-start">
//                 <span className="text-orange-500 mr-2">•</span>
//                 Schools added here will appear in the analyze page dropdown
//               </li>
//               {isAllChapter ? (
//                 <>
//                   <li className="flex items-start">
//                     <span className="text-orange-500 mr-2">•</span>
//                     As a super admin, you can add schools to any chapter
//                   </li>
//                   <li className="flex items-start">
//                     <span className="text-orange-500 mr-2">•</span>
//                     Enter the exact chapter name (case-sensitive)
//                   </li>
//                 </>
//               ) : (
//                 <li className="flex items-start">
//                   <span className="text-orange-500 mr-2">•</span>
//                   Schools will be added to your chapter: <span className="font-semibold text-blue-600">{adminChapter}</span>
//                 </li>
//               )}
//               <li className="flex items-start">
//                 <span className="text-orange-500 mr-2">•</span>
//                 Enter the complete and correct school name for accuracy
//               </li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddSchools;





import React, { useState, useEffect } from "react";
import Header from "../components/Header";

const AddSchools = () => {
  const [adminChapter, setAdminChapter] = useState("");
  const [chapterName, setChapterName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isAllChapter, setIsAllChapter] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    // Get admin chapter details from localStorage (set during login from users.json)
    const fetchAdminDetails = async () => {
      try {
        // DEBUGGING: Check what's in localStorage
        console.log("🔍 All localStorage keys:", Object.keys(localStorage));
        console.log("🔍 Raw localStorage user:", localStorage.getItem('user')); // Changed from 'adminData' to 'user'
        console.log("🔍 Raw localStorage adminData:", localStorage.getItem('adminData'));
        
        // Get admin data stored during login (from users.json)
        // Try 'user' key first, then fall back to 'adminData'
        const userData = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('adminData')) || {};
        const chapter = userData.chapter;
        
        console.log("🔍 Parsed userData object:", userData);
        console.log("🔍 Retrieved admin chapter:", chapter);
        console.log("🔍 Chapter type:", typeof chapter);
        console.log("🔍 Chapter length:", chapter?.length);
        
        if (!chapter) {
          console.error("❌ No chapter found in adminData");
          setMessage("Admin chapter not found. Please login again.");
          setMessageType("error");
          setAdminLoading(false);
          return;
        }
        
        setAdminChapter(chapter);
        
        // Check if admin has ALL_Chapter permissions (exact match)
        // ONLY "ALL_Chapter" gets dropdown, ANY other chapter (Chennai, Madurai, etc.) does NOT
        const isAllChapterAdmin = chapter === "ALL_Chapter";
        console.log("🔍 Checking chapter === 'ALL_Chapter':", `${chapter}` === "ALL_Chapter");
        console.log("🔍 Is All Chapter Admin:", isAllChapterAdmin);
        
        setIsAllChapter(isAllChapterAdmin);
        
        // For ALL specific chapter admins (Chennai, Madurai, Coimbatore, etc.), pre-set their chapter
        if (!isAllChapterAdmin) {
          setChapterName(chapter); // Pre-fill with admin's specific chapter (no dropdown)
          console.log("🔍 Set chapterName to:", chapter);
        } else {
          console.log("🔍 ALL_Chapter admin - dropdown will be shown");
        }
        
        console.log("✅ Final state - isAllChapter:", isAllChapterAdmin, "adminChapter:", chapter);
        
      } catch (error) {
        console.error("❌ Error fetching admin details:", error);
        setMessage("Error fetching admin details. Please login again.");
        setMessageType("error");
      } finally {
        setAdminLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation
    if (!schoolName.trim()) {
      setMessage("School name is required");
      setMessageType("error");
      setLoading(false);
      return;
    }

    // For ALL_Chapter admins, chapter selection is required
    if (isAllChapter && !chapterName.trim()) {
      setMessage("Please select a chapter");
      setMessageType("error");
      setLoading(false);
      return;
    }

    try {
      const requestBody = {
        // For ALL_Chapter admins: use selected chapter
        // For specific chapter admins: use their fixed chapter
        chapter: isAllChapter ? chapterName.trim() : adminChapter,
        school: schoolName.trim(),
        adminChapter: adminChapter, // Track which admin added this school
        addedBy: JSON.parse(localStorage.getItem('user'))?.email || JSON.parse(localStorage.getItem('adminData'))?.email || 'Unknown'
      };

      console.log("Adding school with data:", requestBody);

      const response = await fetch("https://chotacop.in/api/add-school", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if you have tokens
          // "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add school: ${errorText}`);
      }

      const result = await response.json();
      console.log("School added successfully:", result);

      setMessage(`School "${schoolName}" added successfully to ${isAllChapter ? chapterName : adminChapter} chapter!`);
      setMessageType("success");
      
      // Reset form
      setSchoolName("");
      // Only reset chapter name for ALL_Chapter admins
      if (isAllChapter) {
        setChapterName("");
      }

    } catch (error) {
      console.error("Error adding school:", error);
      setMessage(`Error adding school: ${error.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching admin details
  if (adminLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-orange-50">
        <Header />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading admin details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if admin chapter couldn't be loaded
  if (!adminChapter && message && messageType === "error") {
    return (
      <div className="flex flex-col min-h-screen bg-orange-50">
        <Header />
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-[#fdf5eb] rounded-lg shadow-lg p-8 w-full max-w-md text-center">
            <div className="text-red-600 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Access Error</h2>
            <p className="text-red-600 mb-4">{message}</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-orange-50">
      <Header />
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-[#fdf5eb] rounded-lg shadow-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Add New School
          </h2>



          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Chapter Selection - ONLY for ALL_Chapter admins */}
            {isAllChapter && (
              <div>
                <label htmlFor="chapterName" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Chapter *
                </label>
                <select
                  id="chapterName"
                  value={chapterName}
                  onChange={(e) => setChapterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
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
                  <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar</option>
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

              </div>
            )}

            {/* Chapter Display - For specific chapter admins */}
            {!isAllChapter && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Chapter
                </label>
                <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
                  {adminChapter}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This school will be added to your assigned chapter
                </p>
              </div>
            )}

            {/* School Name Input */}
            <div>
              <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                School Name *
              </label>
              <input
                type="text"
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter complete school name"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 bg-purple-600 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed text-gray-200"
                  : "bg-purple-600 text-white hover:bg-purple-800 focus:ring-2 focus:ring-orange-500 shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Adding School...
                </div>
              ) : (
                "Add School"
              )}
            </button>
          </form>

          {/* Message Display */}
          {message && messageType && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm animate-fade-in ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 border border-green-300"
                  : "bg-red-100 text-red-800 border border-red-300"
              }`}
            >
              <div className="flex items-center">
                {messageType === "success" ? (
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                )}
                {message}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AddSchools;