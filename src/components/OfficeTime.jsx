import React, { useState, useEffect } from "react";

const TARGET = "https://sitopsliveapigateway.shaligraminfotech.com";

// Set your predefined token and userId here
const PREDEFINED_TOKEN = `Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IntcIklkXCI6MCxcIlVzZXJJZFwiOjg3LFwiUm9sZUlkXCI6MixcIkxhc3ROYW1lXCI6XCJBbWJhc2FuYVwiLFwiRmlyc3ROYW1lXCI6XCJOaXJtYWxcIixcIkVtYWlsSWRcIjpcIm5pcm1hbC5hQHNoYWxpZ3JhbWluZm90ZWNoLmNvbVwiLFwiRnVsbE5hbWVcIjpcIk5pcm1hbEFtYmFzYW5hXCIsXCJUb2tlblZhbGlkVG9cIjpcIjIwMjUtMDctMThUMDc6MjU6MDIuOTE5NzcxNFpcIixcIkltYWdlc1wiOlwiaHR0cHM6Ly9zaXRvcHNsaXZlYXBpLnNoYWxpZ3JhbWluZm90ZWNoLmNvbS9BdXRoZW50aWNhdGlvbi9Qcm9maWxlSW1hZ2VzL1wiLFwiSXNTdXBlckFkbWluXCI6ZmFsc2UsXCJVc2VyQ29kZVwiOlwiNDk0XCIsXCJUb2tlblwiOm51bGwsXCJSb2xlVmFsdWVcIjpcIkVtcGxveWVlXCIsXCJEZXNpZ25hdGlvbk5hbWVzXCI6XCJKci4gU29mdHdhcmUgRGV2ZWxvcGVyXCIsXCJEYXRlb2ZCaXJ0aFwiOlwiMjAwMy0wMi0yNVQwMDowMDowMFwiLFwiRGF0ZW9mSm9pbmluZ1wiOlwiMjAyNC0wMi0wMVQwMDowMDowMFwifSIsIm5iZiI6MTc1MjIxODcwMiwiZXhwIjoxNzUyODIzNTAyLCJpYXQiOjE3NTIyMTg3MDJ9.vE_1t9mhn8Tb2bfUL-8yiT9GGTJ5G_PS50ICBiafcx_xXnCcYWBAnMg2xEOXPKbcEwAd-fKCbhqRUSYIFtLvfg`;
const PREDEFINED_USERID = "87";

function OfficeTime() {
  const [timeLeft, setTimeLeft] = useState("--:--:--");
  const [error, setError] = useState(null);

  const parseBreakMinutes = (str) => {
    const h = str?.match(/(\d+)\s*H/i);
    const m = str?.match(/(\d+)\s*M/i);
    return (h ? parseInt(h[1]) : 0) * 60 + (m ? parseInt(m[1]) : 0);
  };

  const fetchTimesheet = async () => {
    setError(null);
    const today = new Date().toISOString().split("T")[0];
    const requestData = {
      UserId: Number(PREDEFINED_USERID),
      fromDate: today,
      toDate: today,
      isActive: null,
      AllRecord: false,
      SortColumn: "EmployeeName",
      SortDirection: "ASC",
      PageNumber: 1,
      PageSize: 25,
      ExEmployee: false,
      IsLateComing: false,
    };

    try {
      const response = await fetch(
        `${TARGET}/hrmservice/Timesheet/getTimeSheetByEmpolyee`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: PREDEFINED_TOKEN,
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      const entry = data?.data?.[0];
      if (entry) {
        window._lastTimesheetData = entry;
        updateTimeLeft(entry);
      } else {
        setError("No timesheet data found");
        setTimeLeft("--:--:--");
      }
    } catch (err) {
      setError(err.message);
      setTimeLeft("--:--:--");
    }
  };

  const updateTimeLeft = (data) => {
    const checkIn = new Date(data.iN_Time);
    const breakMins = parseBreakMinutes(data.break_hours || "0");
    const now = new Date();
    const fullDayMinutes = 480;
    const targetTime = new Date(
      checkIn.getTime() + fullDayMinutes * 60 * 1000 + breakMins * 60 * 1000
    );
    let remainingMs = targetTime - now;

    if (remainingMs < 0) remainingMs = 0;

    const hrs = Math.floor(remainingMs / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
    const pad = (n) => String(n).padStart(2, "0");
    setTimeLeft(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
  };

  useEffect(() => {
    fetchTimesheet();
    const interval = setInterval(() => {
      if (window._lastTimesheetData) {
        updateTimeLeft(window._lastTimesheetData);
      } else {
        fetchTimesheet();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span className="office-time" style={{ marginLeft: "10px" }}>
      <i className="nf nf-fa-clock_o"></i> {error ? error : timeLeft}
    </span>
  );
}

export default OfficeTime;
