document.getElementById("generate").addEventListener("click", async () => {
    const jobDesc = document.getElementById("jobDesc").value;
    const resume = document.getElementById("resume").value;
  
    const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        job_description: jobDesc,
        resume: resume
      })
    });
  
    const data = await response.json();
  
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: "fill",
        content: data.result
      });
    });
  });