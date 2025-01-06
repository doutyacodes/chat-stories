"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import GlobalApi from "@/app/_services/GlobalApi";
import { usePathname, useRouter } from "next/navigation";
import WelcomeCard from "@/app/_components/WelcomeCard";
import LoadingSpinner from "@/app/_components/LoadingSpinner";
import AgeSelectionPopup from "@/app/_components/AgeSelectionPopup"; // Create this component
import RegionSelectionPopup from "@/app/_components/RegionSelectionPopup"; // Create this component
import useAuth from "@/app/hooks/useAuth";

const ChildrenContext = createContext();

export const ChildrenProvider = ({ children }) => {
  const [childrenData, setChildrenData] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [selectedAge, setSelectedAge] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedWeeks, setSelectedWeeks] = useState(null);
  const [selectedDob, setSelectedDob] = useState(null);
  const [selectedName, setSelectedName] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedGrade, setSelectedGrade] = useState(null);
  // const [selectedRegion, setSelectedRegion] = useState("India"); // Default to India
  const [selectedRegion, setSelectedRegion] = useState(() => {
    // Fetch the region from localStorage on initial render
    const storedRegion = typeof window !== "undefined" ? localStorage.getItem("userRegion") : null;
    return storedRegion || "India"; // Default to India if no value is stored
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAgePopup, setShowAgePopup] = useState(false); // For unauthenticated age selection
  const [showRegionPopup, setShowRegionPopup] = useState(false); // Region selection popup
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const pathname = usePathname()

  // console.log('selectedRegion', selectedRegion)

  const updateChildrenData = (data) => {
    setChildrenData(data);
  };

  const selectChild = (childId) => {
    const selectedChild = childrenData.find(
      (child) => child.id === parseInt(childId)
    );
    if (selectedChild) {
      setSelectedChildId(selectedChild.id);
      setSelectedAge(selectedChild.age);
      setSelectedGender(selectedChild.gender);
      setSelectedName(selectedChild.name);
      setSelectedWeeks(selectedChild.weeks);
      setSelectedDob(selectedChild.dob);
      setSelectedGrade(selectedChild.grade);
      setShowPopup(true);
    }
  };

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => {
        setShowPopup(false);
        // router.push("/");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup, router]);

  const fetchChildren = async () => {
    try {
      setLoading(true);
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (token) {
        const response = await GlobalApi.GetUserChildren(token);
        const children = response.data.data;
        setChildrenData(children);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegion = async () => {
    try {
      console.log("fetch region");
      
      const storedRegion = localStorage.getItem("userRegion");
      if (storedRegion) {
        console.log("storedRegion region", storedRegion);
        setSelectedRegion(storedRegion);
      } else {
        console.log("Else");
        // Default to India if geolocation is not available
        setSelectedRegion("India");
        localStorage.setItem("userRegion", "India");
      }
    } catch (error) {
      console.error("Error fetching region:", error);
    }
  };

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) {
      fetchChildren();
    } else {
      // Check localStorage for age data when not authenticated
      const storedAge = localStorage.getItem("selectedAge");
      if (storedAge) {
        setSelectedAge(Number(storedAge));
      } else if(!storedAge && pathname.includes("news")) {
        setShowAgePopup(true); // Show popup for age selection
      }
    }

    // Fetch region
    fetchRegion();
    console.log("hi")
  }, [isAuthenticated,pathname]);

  const handleAgeSubmit = (age) => {
    if (age >= 3 && age <= 12) {
      setSelectedAge(age);
      localStorage.setItem("selectedAge", age); // Store age in localStorage
      setShowAgePopup(false); // Close the popup
    }
  };

  const handleRegionChange = (region) => {
    setSelectedRegion(region);
    localStorage.setItem("userRegion", region); // Allow user to change and store new region
    setShowRegionPopup(false); // Close region popup
  };

  const showPopupForUser = () => {
    setShowAgePopup(true);
  };

  const showPopupRegion = () => {
    setShowRegionPopup(true);
  };

  useEffect(() => {
    const handleSingleData = () => {
      if (!selectedChildId && childrenData.length > 0) {
        selectChild(childrenData[0].id);
        setSelectedChild(childrenData[0]);
      }
    };
    handleSingleData();
  }, [childrenData]);

  return (
    <ChildrenContext.Provider
      value={{
        childrenData,
        updateChildrenData,
        selectedChildId,
        selectChild,
        selectedAge,
        selectedGender,
        selectedName,
        selectedWeeks,
        setSelectedAge,
        selectedDob,
        loading,
        selectedChild,
        selectedGrade,
        selectedRegion,
        handleRegionChange,
        showPopupForUser,
        showPopupRegion,
      }}
    >
      {loading ? <LoadingSpinner /> : children}
      {showPopup && selectedName && selectedAge && (
        <WelcomeCard
          data={{
            name: selectedName,
            age: selectedAge,
            gender: selectedGender,
          }}
        />
      )}
      {showAgePopup && (
        <AgeSelectionPopup
          onSubmit={handleAgeSubmit}
          onClose={() => setShowAgePopup(false)}
        />
      )}
      {showRegionPopup && (
        <RegionSelectionPopup
          selectedRegion={selectedRegion}
          onSubmit={handleRegionChange}
          onClose={() => setShowRegionPopup(false)}
        />
      )}
    </ChildrenContext.Provider>
  );
};

export const useChildren = () => {
  return useContext(ChildrenContext);
};
