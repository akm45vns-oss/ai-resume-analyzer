const uploadAndAnalyze = async () => {
  const formData = new FormData();
  formData.append("file", selectedFile);
  formData.append("jd_text", jdText); // text from your JD input box

  const res = await fetch("http://localhost:8000/analyze_with_jd", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  console.log("Final Enhanced Result:", data);

  setAnalysisResult(data); // Update your UI state
};
