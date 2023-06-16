document.getElementById("save-btn").onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  let result;
  try {
    [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => getSelection().toString(),
    });
  } catch (e) {
    return; // ignoring an unsupported page like chrome://extensions
  }
  // document.body.append('Selection: ' + result);
  console.log(result);
  callChatGPTAPI(result);
};

async function callChatGPTAPI(userQuestion) {
  const container = document.getElementById("question-container");
  const spinner = document.getElementById("spinner");
  spinner.style.display = "block";
  const url = "https://chatgpt53.p.rapidapi.com/";
  const headers = {
    "Content-Type": "application/json",
    "X-RapidAPI-Key": "eaf92ecad4msh778029df2adc943p145726jsn095ea7d9ca6c",
    "X-RapidAPI-Host": "chatgpt53.p.rapidapi.com",
  };
  const requestBody = {
    messages: [
      {
        role: "user",
        content:
          "create 5 MCQ for:" +
          userQuestion +
          " Each question should be on new line and the options also should be on new line with proper formating at the end provide ans for every questions",
      },
    ],
    temperature: 1,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(requestBody),
    });
    const data = await response.json();
    console.log(data);
    displayResponse(data);
  } catch (error) {
    console.error(error);
    // Handle any errors that occurred during the request
    container.append(error);
    spinner.style.display = "none"; 
  } finally {
    spinner.style.display = "none"; // hide the spinner
  }
}

function displayResponse(responseData) {
  const messageContent = responseData.choices[0].message.content;
  const container = document.getElementById("question-container");

  container.innerHTML += "<h2>5 MCQ Based On The Text You Selected</h2><br>";
  let str = "";
  for (let i = 0; i < messageContent.length; i++) {
    if (messageContent[i] === "\n") {
    
      console.log(str);
      container.append(str);
      container.innerHTML += "<br>";
      str = "";
      continue;
    }
   
    str += messageContent[i];
  }
  container.append(str);
}
