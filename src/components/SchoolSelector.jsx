import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QuestionMatrix from "./QuestionMatrix";
import ResponseBoxes from "./ResponseBoxes";
import ActionDocument from "./Action_Doc_button";
import CertificateButton from "./Cert_Button";
import BrowserTabs from "./BrowserTabs";
import CertificateTab from "./CertificateTab";

const API_ENDPOINT = "https://chotacop.in/api/chapter-data";

const SchoolSelector = ({ selectedChapter, setSelectedChapter, selectedSchool, setSelectedSchool }) => {
  const [schools, setSchools] = useState([]);
  const [userId, setUserId] = useState("");
  const [activeTab, setActiveTab] = useState("response");
  const navigate = useNavigate();

  const [observationAnalysisData, setObservationAnalysisData] = useState(null);
  const [questionStatsAnalysisData, setQuestionStatsAnalysisData] = useState(null);

  const [responseData, setResponseData] = useState(null);
  const [availableChapters, setAvailableChapters] = useState([]);
  const [isAllChapterStructure, setIsAllChapterStructure] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "response") {
      navigate("/analyze");
    }
  };

  // Fetch user ID
  useEffect(() => {
    const userData = localStorage.getItem("user");
    try {
      if (userData) {
        const parsed = JSON.parse(userData);
        const user_id = parsed?.userId;

        if (user_id) {
          setUserId(user_id);
          setSelectedChapter("");
          setSelectedSchool("");
          setObservationAnalysisData(null);
          setQuestionStatsAnalysisData(null);
          setResponseData(null);
          setSchools([]);
          setAvailableChapters([]);
          setIsAllChapterStructure(false);
        } else {
          console.warn("User data found but no userId.");
          alert("User ID not found. Please sign in again.");
        }
      } else {
        alert("Please sign in first.");
      }
    } catch (error) {
      console.error("Failed to parse user data:", error);
      alert("Error reading user data. Please sign in again.");
    }
  }, []);

  // Fetch chapter/school data
  useEffect(() => {
    if (!userId) {
      setSchools([]);
      setSelectedChapter("");
      setSelectedSchool("");
      setObservationAnalysisData(null);
      setQuestionStatsAnalysisData(null);
      setResponseData(null);
      setAvailableChapters([]);
      setIsAllChapterStructure(false);
      return;
    }

    if (responseData !== null) return;

    axios
      .post(API_ENDPOINT, { user_id: userId })
      .then((response) => {
        const responseData = response.data;

        if (
          responseData &&
          typeof responseData === "object" &&
          responseData.chapter === "ALL_Chapter" &&
          responseData.chapters &&
          typeof responseData.chapters === "object"
        ) {
          // Handle ALL_Chapter structure
          setIsAllChapterStructure(true);
          setResponseData(responseData);
          
          const chapters = Object.keys(responseData.chapters);
          setAvailableChapters(chapters);
          
          if (chapters.length > 0) {
            setSelectedChapter(chapters[0]); // Auto-select first chapter
          }
        } else if (
          responseData &&
          typeof responseData === "object" &&
          responseData.chapter &&
          responseData.observation &&
          typeof responseData.observation === "object"
        ) {
          // Handle single chapter structure
          setIsAllChapterStructure(false);
          setResponseData(responseData);
          setSelectedChapter(responseData.chapter);

          const schoolNames = Object.keys(responseData.observation);
          setSchools(schoolNames);
          setSelectedSchool(schoolNames.length > 0 ? "All Schools" : "");
        } else {
          console.error("Unexpected API response:", responseData);
          alert("Error fetching initial data.");
          setSelectedChapter("");
          setSchools([]);
          setResponseData(null);
          setAvailableChapters([]);
          setIsAllChapterStructure(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching initial data:", error);
        alert("Failed to fetch chapter and school data.");
        setSchools([]);
        setSelectedChapter("");
        setSelectedSchool("");
        setResponseData(null);
        setAvailableChapters([]);
        setIsAllChapterStructure(false);
      });
  }, [userId]);

  // Update schools + analysis data when chapter changes
  useEffect(() => {
    if (!selectedChapter || !responseData) {
      setSchools([]);
      setSelectedSchool("");
      setObservationAnalysisData(null);
      setQuestionStatsAnalysisData(null);
      return;
    }

    if (isAllChapterStructure && responseData?.chapters) {
      // Get data for the selected chapter
      const chapterData = responseData.chapters[selectedChapter];
      
      // Collect schools from both question_stats_by_school and observation
      let allSchools = new Set();
      
      // Add schools from question_stats_by_school
      if (chapterData?.question_stats_by_school) {
        Object.keys(chapterData.question_stats_by_school).forEach(school => {
          allSchools.add(school);
        });
      }
      
      // Add schools from observation
      if (chapterData?.observation) {
        Object.keys(chapterData.observation).forEach(school => {
          allSchools.add(school);
        });
      }
      
      // Convert Set to Array and add "All Schools" option
      const schoolNames = Array.from(allSchools);
      const newSchools = ["All Schools", ...schoolNames];
      setSchools(newSchools);
      
      if (schoolNames.length > 0 && !selectedSchool) {
        setSelectedSchool("All Schools");
      } else if (schoolNames.length === 0) {
        setSelectedSchool("");
      }
    } else if (!isAllChapterStructure && responseData?.observation) {
      // Handle single chapter structure
      const schoolNames = Object.keys(responseData.observation);
      const newSchools = ["All Schools", ...schoolNames];
      setSchools(newSchools);
      
      if (schoolNames.length > 0 && !selectedSchool) {
        setSelectedSchool("All Schools");
      } else if (schoolNames.length === 0) {
        setSelectedSchool("");
      }
    }
  }, [selectedChapter, responseData, isAllChapterStructure]);

  // Update analysis data when school changes
  useEffect(() => {
    if (!selectedChapter || !selectedSchool || !responseData) {
      setObservationAnalysisData(null);
      setQuestionStatsAnalysisData(null);
      return;
    }

    let currentObservationAnalysis = null;
    let currentQuestionStatsAnalysis = null;

    // Helper: build zero ride stats from observation length to avoid divide-by-zero
    const buildZeroRideStatsFromObservation = (obsArray) => {
      const length = Array.isArray(obsArray) ? obsArray.length : 0;
      let zeroStats = [];
      for (let qIndex = 0; qIndex < length; qIndex++) {
        let ridesArray = [];
        for (let i = 0; i <= 6; i++) {
          ridesArray.push({ ride: `ride_${i}`, yes: 0, no: 0, total: 1 });
        }
        zeroStats.push({ qIndex, rides: ridesArray, qName: `q${qIndex + 1}` });
      }
      return zeroStats;
    };

    if (isAllChapterStructure && responseData?.chapters) {
      const chapterData = responseData.chapters[selectedChapter];

      // Process Observation data (for Card Data column)
      if (chapterData?.observation) {
        if (selectedSchool === "All Schools") {
          let aggregatedObservationData = [];
          const schoolsToAggregate = Object.keys(chapterData.observation);
          if (schoolsToAggregate.length > 0) {
            const firstSchoolName = schoolsToAggregate[0];
            const firstSchoolObservation = chapterData.observation[firstSchoolName];
            if (Array.isArray(firstSchoolObservation)) {
              aggregatedObservationData = firstSchoolObservation.map((q) => ({
                q: q.q,
                yes: 0,
                no: 0,
              }));
              schoolsToAggregate.forEach((schoolName) => {
                const schoolObservation = chapterData.observation[schoolName];
                if (Array.isArray(schoolObservation)) {
                  schoolObservation.forEach((question, qIdx) => {
                    if (aggregatedObservationData[qIdx]) {
                      aggregatedObservationData[qIdx].yes += question.yes || 0;
                      aggregatedObservationData[qIdx].no += question.no || 0;
                    }
                  });
                }
              });
              currentObservationAnalysis = aggregatedObservationData;
            }
          }
        } else {
          currentObservationAnalysis = chapterData.observation[selectedSchool] || null;
        }
      }

      // Process question_stats_by_school data (for Ride 1-7 columns)
      if (chapterData?.question_stats_by_school) {
        if (selectedSchool === "All Schools") {
          // Aggregate data from all schools in question_stats_by_school
          let aggregatedRideStats = [];
          const schoolsToAggregate = Object.keys(chapterData.question_stats_by_school);
          
          if (schoolsToAggregate.length > 0) {
            // Get the first school's structure to initialize the array
            const firstSchoolName = schoolsToAggregate[0];
            const firstSchoolStats = chapterData.question_stats_by_school[firstSchoolName];
            
            if (firstSchoolStats) {
              const questionKeys = Object.keys(firstSchoolStats);
              
              questionKeys.forEach((qKey, qIndex) => {
                let ridesArray = [];
                for (let i = 0; i <= 6; i++) {
                  const rideKey = `ride_${i}`;
                  let aggregatedRideData = { ones: 0, zeros: 0, total: 0 };
                  
                  // Sum up data from all schools for this question and ride
                  schoolsToAggregate.forEach(schoolName => {
                    const schoolStats = chapterData.question_stats_by_school[schoolName];
                    if (schoolStats?.[qKey]?.rides?.[rideKey]) {
                      const rideData = schoolStats[qKey].rides[rideKey];
                      aggregatedRideData.ones += rideData.ones || 0;
                      aggregatedRideData.zeros += rideData.zeros || 0;
                      aggregatedRideData.total += rideData.total || 0;
                    }
                  });
                  
                  ridesArray.push({
                    ride: rideKey,
                    yes: aggregatedRideData.ones,
                    no: aggregatedRideData.zeros,
                    total: aggregatedRideData.total || 1,
                  });
                }
                
                aggregatedRideStats.push({ qIndex, rides: ridesArray, qName: qKey });
              });
            }
          }
          // If nothing aggregated, fallback to zero template based on observation
          if (aggregatedRideStats.length === 0) {
            currentQuestionStatsAnalysis = buildZeroRideStatsFromObservation(currentObservationAnalysis);
          } else {
            currentQuestionStatsAnalysis = aggregatedRideStats;
          }
        } else {
          // Single school data - check if the school exists in question_stats_by_school
          if (chapterData.question_stats_by_school[selectedSchool]) {
            let rideStatsData = [];
            const questionKeys = Object.keys(chapterData.question_stats_by_school[selectedSchool]);
            
            questionKeys.forEach((qKey, qIndex) => {
              const questionStats = chapterData.question_stats_by_school[selectedSchool][qKey];
              if (questionStats?.rides) {
                const ridesData = questionStats.rides;
                let ridesArray = [];
                for (let i = 0; i <= 6; i++) {
                  const rideKey = `ride_${i}`;
                  const rideData = ridesData[rideKey] || { ones: 0, zeros: 0, total: 0 };
                  ridesArray.push({
                    ride: rideKey,
                    yes: rideData.ones || 0,
                    no: rideData.zeros || 0,
                    total: (rideData.total || 0) || 1,
                  });
                }
                rideStatsData.push({ qIndex, rides: ridesArray, qName: qKey });
              } else {
                let ridesArray = [];
                for (let i = 0; i <= 6; i++) {
                  ridesArray.push({ ride: `ride_${i}`, yes: 0, no: 0, total: 1 });
                }
                rideStatsData.push({ qIndex, rides: ridesArray, qName: qKey });
              }
            });
            currentQuestionStatsAnalysis = rideStatsData;
          } else {
            // School doesn't have data in question_stats_by_school, create zeroed structure from observation length
            currentQuestionStatsAnalysis = buildZeroRideStatsFromObservation(currentObservationAnalysis);
          }
        }
      } else {
        // No question_stats_by_school data available, create zeroed structure from observation length
        currentQuestionStatsAnalysis = buildZeroRideStatsFromObservation(currentObservationAnalysis);
      }
    } else if (!isAllChapterStructure && responseData?.observation) {
      // Handle single chapter structure
      if (selectedSchool && responseData.observation) {
        if (selectedSchool === "All Schools") {
          const schoolData = responseData.observation;
          const schoolsToAggregate = Object.keys(schoolData);
          if (schoolsToAggregate.length > 0) {
            const firstSchoolName = schoolsToAggregate[0];
            const firstSchoolObservation = schoolData[firstSchoolName];
            if (Array.isArray(firstSchoolObservation)) {
              let aggregatedObservationData = firstSchoolObservation.map((q) => ({
                q: q.q,
                yes: 0,
                no: 0,
              }));
              schoolsToAggregate.forEach((schoolName) => {
                const schoolObservation = schoolData[schoolName];
                if (Array.isArray(schoolObservation)) {
                  schoolObservation.forEach((question, qIdx) => {
                    if (aggregatedObservationData[qIdx]) {
                      aggregatedObservationData[qIdx].yes += question.yes || 0;
                      aggregatedObservationData[qIdx].no += question.no || 0;
                    }
                  });
                }
              });
              currentObservationAnalysis = aggregatedObservationData;
            }
          }
        } else {
          currentObservationAnalysis = responseData.observation[selectedSchool] || null;
        }
      }
      // No question_stats_by_school in single chapter path; zeroed template from observation
      currentQuestionStatsAnalysis = buildZeroRideStatsFromObservation(currentObservationAnalysis);
    }

    setObservationAnalysisData(currentObservationAnalysis);
    setQuestionStatsAnalysisData(currentQuestionStatsAnalysis);
  }, [
    selectedChapter,
    selectedSchool,
    responseData,
    isAllChapterStructure,
  ]);

  return (
    <div className="flex flex-col gap-6 mt-6 mb-10">
      {/* Tabs */}
      <BrowserTabs activeTab={activeTab} onTabClick={handleTabClick} />

      {/* Content */}
      <div className="bg-[#fdf5eb] border border-t-0 border-gray-200 rounded-b-lg p-4">
        {activeTab === "response" ? (
          <>
            {/* Action Document Button */}
            <div className="sm:flex-shrink-0 mb-6">
              <ActionDocument
                selectedChapter={selectedChapter}
                selectedSchool={selectedSchool}
                observationAnalysisData={observationAnalysisData}
                questionStatsAnalysisData={questionStatsAnalysisData}
              />
            </div>

            {/* Chapter + School */}
            <div className="flex flex-row gap-4">
              
              <div className="w-full md:w-[700px]">
                <label className="block text-sm font-medium mb-1">Chapter</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  {isAllChapterStructure ? (
                    <select
                      className="p-2 border rounded-lg w-full sm:flex-1 min-w-0"
                      value={selectedChapter}
                      onChange={(e) => {
                        setSelectedChapter(e.target.value);
                        setSelectedSchool(""); // Reset school when chapter changes
                      }}
                      disabled={!userId || availableChapters.length === 0}
                    >
                      <option value="">Select a chapter</option>
                      {availableChapters.map((chapterName, index) => (
                        <option key={chapterName || index} value={chapterName}>
                          {chapterName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className="p-2 border rounded-lg w-full sm:flex-1 min-w-0 bg-gray-100 text-gray-700"
                      value={selectedChapter || "Loading chapter..."}
                      readOnly
                      disabled
                    />
                  )}
                </div>
              </div>

              {/* School + Certificate */}
              <div className="w-full md:w-[700px]">
                <label className="block text-sm font-medium mb-1">School</label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <select
                    className="p-2 border rounded-lg w-full sm:flex-1 min-w-0"
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    disabled={!selectedChapter || schools.length === 0}
                  >
                    <option value="">Select a school</option>
                    {schools.includes("All Schools") && <option value="All Schools">All Schools</option>}
                    {schools
                      .filter((school) => school !== "All Schools")
                      .map((school, index) => (
                        <option key={school || index} value={school}>
                          {school}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Matrix */}
            <QuestionMatrix
              observationAnalysisData={observationAnalysisData}
              questionStatsAnalysisData={questionStatsAnalysisData}
            />

            {/* Response boxes */}
            <div className="flex items-end gap-4 mb-2">
              <div className="flex flex-col w-[220px]">
                <div className="rounded-lg w-full font-medium"></div>
              </div>
              <div className="flex-1">
                <ResponseBoxes count={8} />
              </div>
            </div>
          </>
        ) : (
          <CertificateTab
            selectedChapter={selectedChapter}
            setSelectedChapter={setSelectedChapter}
            selectedSchool={selectedSchool}
            setSelectedSchool={setSelectedSchool}
          />
        )}
      </div>
    </div>
  );
};

export default SchoolSelector;
