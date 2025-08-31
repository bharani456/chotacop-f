import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";

const ChangeEmail = () => {
  const [newEmail, setNewEmail] = useState("");
  const [step, setStep] = useState("email");
  const [otp, setOtp] = useState(["", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef([]);

  // Get current user email from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const currentEmail = currentUser?.email || "";

  // Countdown timer
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Generate OTP
  const generateRandomOtp = () => {
    return Math.floor(100 + Math.random() * 900).toString(); // 3-digit OTP
  };

  // Send OTP to current email
  const sendOtp = async () => {
    if (!newEmail) return alert("Please enter a new email first.");
    if (!currentEmail) return alert("No current email found. Please log in.");

    setLoading(true);
    setErrorMessage("");
    const newOtp = generateRandomOtp();
    setGeneratedOtp(newOtp);

    try {
      const response = await axios.post("https://chotacop.in/api/send-otp", {
        email: currentEmail, // send OTP to current email
        otp: newOtp,
      });

      if (response.data?.message === "OTP sent successfully") {
        setTimer(30);
        setStep("otp");
        alert(`OTP sent to your current email: ${currentEmail}`);

        setErrorMessage("Failed to send OTP. Please try again.");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setErrorMessage("Failed to send OTP. Check your network or contact support.");
    } finally {
      setLoading(false);
    }
  };

  // Handle new email submit
  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    await sendOtp();
  };

  // Handle OTP input
  const handleOtpChange = (e, index) => {
    const { value } = e.target;
    if (!/^[0-9]?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);

    if (value && index < 2) {
      inputsRef.current[index + 1].focus();
    } else if (!value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // Verify OTP and update email
  // Verify OTP and update email
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");
  
    if (enteredOtp.length !== 3) return alert("Enter 3-digit OTP.");
    if (enteredOtp !== generatedOtp) return alert("Invalid OTP.");
    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return alert("Please enter a valid new email.");
    }
  
    try {
      setLoading(true);
      setErrorMessage("");
  
      const payload = {
        user_id: currentUser?.user_id || currentUser?.id || currentUser?.userId,
        new_email: newEmail, // must be snake_case
      };
  
      console.log("Current user from localStorage:", currentUser);
      console.log("Payload being sent to API:", payload);
  
      if (!payload.user_id) {
        setErrorMessage("Missing user_id. Please log in again.");
        return;
      }
  
      const response = await axios.post("https://chotacop.in/api/change-mail", payload);
  
      if (response.data?.message === "Email changed successfully") {
        alert("Email updated successfully!");
        const updatedUser = { ...currentUser, email: response.data.new_email };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setNewEmail("");
        setStep("email");
        setOtp(["", "", ""]);
        setErrorMessage("");
      } else {
        setErrorMessage(response.data?.message || "Failed to update email.");
      }
    } catch (error) {
      console.error("Error updating email:", error.response?.data || error.message);
      setErrorMessage("Failed to update email. Check your network or contact support.");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <div className="min-h-screen bg-[#fdf5eb] flex flex-col">
      <div className="w-full z-10">
        <Header />
      </div>

      <div className="flex flex-grow items-center justify-center px-4 py-10 mt-[-130px]">
        <form
          onSubmit={step === "email" ? handleEmailSubmit : handleVerifyOtp}
          className="bg-[#fdf5eb] shadow-xl p-8 rounded-xl w-full max-w-md space-y-6"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800">Change Email</h2>

          {step === "email" && (
            <div>
              <label className="block text-gray-700 mb-1">New Email Address</label>
              <input
                type="email"
                placeholder="new example@email.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Enter 3-Digit OTP (sent to {currentEmail})</label>
                <div className="flex justify-between space-x-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(e, index)}
                      ref={(el) => (inputsRef.current[index] = el)}
                      className="w-14 h-14 text-center border border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={sendOtp}
                  disabled={timer > 0 || loading}
                  className={`text-sm font-semibold ${
                    timer > 0 || loading
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-purple-600 hover:underline"
                  }`}
                >
{timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
</button>
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="text-red-600 text-center">{errorMessage}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 ${
              loading ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
            } text-white font-semibold rounded-lg transition`}
          >
            {step === "email" ? "Send OTP" : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangeEmail;




// import React, { useState, useRef, useEffect } from "react";
// import axios from "axios";
// import Header from "../components/Header";

// const ChangeEmail = () => {
//   const [newEmail, setNewEmail] = useState("");
//   const [step, setStep] = useState("email");
//   const [otp, setOtp] = useState(["", "", ""]);
//   const [generatedOtp, setGeneratedOtp] = useState("");
//   const [timer, setTimer] = useState(0);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [loading, setLoading] = useState(false);
//   const inputsRef = useRef([]);

//   // Get current user from localStorage
//   const currentUser = JSON.parse(localStorage.getItem("user"));
//   const currentEmail = currentUser?.email || "";

//   // Countdown timer
//   useEffect(() => {
//     let interval;
//     if (timer > 0) {
//       interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//     }
//     return () => clearInterval(interval);
//   }, [timer]);

//   // Generate OTP
//   const generateRandomOtp = () => {
//     return Math.floor(100 + Math.random() * 900).toString(); // 3-digit OTP
//   };

//   // Send OTP to the email from input field
//   const sendOtp = async () => {
//     if (!newEmail) {
//       alert("Please enter a new email first.");
//       return;
//     }
    
//     // Basic email validation
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
//       alert("Please enter a valid email address.");
//       return;
//     }

//     setLoading(true);
//     setErrorMessage("");
    
//     // Generate OTP
//     const newOtp = generateRandomOtp();
//     setGeneratedOtp(newOtp);

//     try {
//       // Send OTP to the new email address from input
//       const response = await axios.post("https://chotacop.in/api/send-otp", {
//         email: newEmail,  // This is directly from the input field
//         otp: newOtp
//       });

//       if (response.data?.message === "OTP sent successfully") {
//         setTimer(30);
//         setStep("otp");
//         alert(`OTP sent successfully to: ${newEmail}`);
//       } else {
//         setErrorMessage("Failed to send OTP. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error sending OTP:", error);
//       setErrorMessage("Failed to send OTP. Please check your email and try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle email form submit
//   const handleEmailSubmit = async (e) => {
//     e.preventDefault();
//     await sendOtp();
//   };

//   // Handle OTP input change
//   const handleOtpChange = (e, index) => {
//     const { value } = e.target;
//     if (!/^[0-9]?$/.test(value)) return;

//     const updatedOtp = [...otp];
//     updatedOtp[index] = value;
//     setOtp(updatedOtp);

//     // Auto focus next/previous input
//     if (value && index < 2) {
//       inputsRef.current[index + 1].focus();
//     } else if (!value && index > 0) {
//       inputsRef.current[index - 1].focus();
//     }
//   };

//   // Verify OTP and update email
//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     const enteredOtp = otp.join("");
  
//     if (enteredOtp.length !== 3) {
//       alert("Please enter complete 3-digit OTP.");
//       return;
//     }
    
//     if (enteredOtp !== generatedOtp) {
//       alert("Invalid OTP. Please try again.");
//       return;
//     }
  
//     try {
//       setLoading(true);
//       setErrorMessage("");
  
//       // Prepare payload for email update
//       const payload = {
//         user_id: currentUser?.user_id || currentUser?.id || currentUser?.userId,
//         new_email: newEmail  // The new email from input field
//       };
  
//       if (!payload.user_id) {
//         setErrorMessage("User not found. Please log in again.");
//         return;
//       }
  
//       // Update email in backend
//       const response = await axios.post("https://chotacop.in/api/change-mail", payload);
  
//       if (response.data?.message === "Email changed successfully") {
//         // Update localStorage
//         const updatedUser = { ...currentUser, email: newEmail };
//         localStorage.setItem("user", JSON.stringify(updatedUser));
        
//         alert("Email updated successfully!");
        
//         // Reset form
//         setNewEmail("");
//         setStep("email");
//         setOtp(["", "", ""]);
//         setGeneratedOtp("");
//         setErrorMessage("");
//         setTimer(0);
//       } else {
//         setErrorMessage(response.data?.message || "Failed to update email.");
//       }
//     } catch (error) {
//       console.error("Error updating email:", error);
//       setErrorMessage("Failed to update email. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle resend OTP
//   const handleResendOtp = async () => {
//     setOtp(["", "", ""]);
//     setErrorMessage("");
//     await sendOtp();
//   };

//   // Go back to email input
//   const handleBackToEmail = () => {
//     setStep("email");
//     setOtp(["", "", ""]);
//     setErrorMessage("");
//     setTimer(0);
//   };

//   return (
//     <div className="min-h-screen bg-[#fdf5eb] flex flex-col">
//       <div className="w-full z-10">
//         <Header />
//       </div>

//       <div className="flex flex-grow items-center justify-center px-4 py-10 mt-[-130px]">
//         <form
//           onSubmit={step === "email" ? handleEmailSubmit : handleVerifyOtp}
//           className="bg-[#fdf5eb] shadow-xl p-8 rounded-xl w-full max-w-md space-y-6"
//         >
//           <h2 className="text-2xl font-bold text-center text-gray-800">
//             Change Email
//           </h2>

//           {/* Display current email */}
//           <div className="text-sm text-gray-600 text-center">
//             Current Email: <span className="font-semibold">{currentEmail || "Not set"}</span>
//           </div>

//           {/* Email Input Step */}
//           {step === "email" && (
//             <div>
//               <label className="block text-gray-700 mb-2">
//                 Enter New Email Address
//               </label>
//               <input
//                 type="email"
//                 placeholder="newemail@example.com"
//                 value={newEmail}
//                 onChange={(e) => setNewEmail(e.target.value)}
//                 required
//                 disabled={loading}
//                 className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
//               />
//             </div>
//           )}

//           {/* OTP Verification Step */}
//           {step === "otp" && (
//             <div className="space-y-4">
//               <div className="text-sm text-gray-600 text-center">
//                 OTP sent to: <span className="font-semibold">{newEmail}</span>
//               </div>
              
//               <div>
//                 <label className="block text-gray-700 mb-3 text-center">
//                   Enter 3-Digit OTP
//                 </label>
//                 <div className="flex justify-center space-x-3">
//                   {otp.map((digit, index) => (
//                     <input
//                       key={index}
//                       type="text"
//                       maxLength="1"
//                       value={digit}
//                       onChange={(e) => handleOtpChange(e, index)}
//                       ref={(el) => (inputsRef.current[index] = el)}
//                       disabled={loading}
//                       className="w-16 h-16 text-center border-2 border-gray-300 rounded-lg text-xl focus:outline-none focus:ring-2 focus:ring-purple-600 disabled:bg-gray-100"
//                     />
//                   ))}
//                 </div>
//               </div>

//               <div className="flex justify-between items-center">
//                 <button
//                   type="button"
//                   onClick={handleBackToEmail}
//                   disabled={loading}
//                   className="text-sm font-semibold text-gray-600 hover:underline disabled:text-gray-400"
//                 >
//                   ← Change Email
//                 </button>
                
//                 <button
//                   type="button"
//                   onClick={handleResendOtp}
//                   disabled={timer > 0 || loading}
//                   className={`text-sm font-semibold ${
//                     timer > 0 || loading
//                       ? "text-gray-400 cursor-not-allowed"
//                       : "text-purple-600 hover:underline"
//                   }`}
//                 >
//                   {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Error Message Display */}
//           {errorMessage && (
//             <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm">
//               {errorMessage}
//             </div>
//           )}

//           {/* Submit Button */}
//           <button
//             type="submit"
//             disabled={loading}
//             className={`w-full py-3 ${
//               loading 
//                 ? "bg-gray-400 cursor-not-allowed" 
//                 : "bg-purple-600 hover:bg-purple-700"
//             } text-white font-semibold rounded-lg transition duration-200`}
//           >
//             {loading ? (
//               "Processing..."
//             ) : (
//               step === "email" ? "Send OTP" : "Verify & Update Email"
//             )}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ChangeEmail;