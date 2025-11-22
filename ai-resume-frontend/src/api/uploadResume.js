const uploadAndAnalyze = async (selectedFile, jdText, setAnalysisResult) => {
  try {
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("jd_text", jdText || "");

    // IMPORTANT: Use your Render backend URL
    const API_URL = "https://ai-resume-analyzer-tw6u.onrender.com";

    const res = await fetch(`${API_URL}/analyze_with_jd`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("API responded with error");
    }

    const data = await res.json();
    console.log("Final Enhanced Result:", data);

    setAnalysisResult(data);
  } catch (err) {
    console.error("Upload error:", err);
    setAnalysisResult({ error: err.message });
  }
};

export default uploadAndAnalyze;
