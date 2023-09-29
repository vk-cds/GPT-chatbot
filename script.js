let msg = [];

const chatinput = document.querySelector(".chat-input textarea");
const sendbtn = document.querySelector(".chat-input span");
const chatbox = document.querySelector(".chatbox");
// const API_KEY = "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"; company
const API_KEY = "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"; //sadelf phone no

let usermsg;
chatinput.addEventListener("keydown", async (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    console.log(msg); //displaying messages array
    await handleChat();
    displaymessages();
  }
});

sendbtn.addEventListener("click", async () => {
  await handleChat();
  console.log(msg); //displaying messages array
  displaymessages();
});

const options = {
  method: "GET",
  headers: {
    "X-RapidAPI-Key": "c0fb0b3daemsh2de21b65ae9cb3bp1e98c3jsn3f8ecf071cd2",
    "X-RapidAPI-Host": "weather-by-api-ninjas.p.rapidapi.com",
  },
};
//Define your GPT functions
async function get_current_weather(location, unit = "celsuis") {
  try {
    const response = await fetch(
      "https://weather-by-api-ninjas.p.rapidapi.com/v1/weather?city=" +
        location,
      options
    );
    const data = await response.json();
    const weather_info = {
      temperature: data.temp,
      location: location,
      unit: unit,
    };
    return JSON.stringify(weather_info);
  } catch (err) {
    console.error(err);
    return JSON.stringify({ error: "Failed to fetch weather data" });
  }
}
//Define college Info function
function get_college_info(name) {
  const collegeInfo = {
    name: name,
    location: "verna",
    majors: ["Mechanical", "computer", "IT", "ECOMP"],
    description: "collage is best",
  };

  return JSON.stringify(collegeInfo);
}
//Define student count function

function get_student_count(clg, dept) {
  const studcount = {
    college: clg,
    count: 150,
    department: dept,
    MECHcount: 45,
    ITcount: 60,
    COMPcount: 80,
    ETCcount: 20,
  };

  return JSON.stringify(studcount);
}

async function run_conversation(usermsg) {
  const messages = [
    { role: "system", content: "You are a sassy assistant." },
    // { role: 'user', content: usermsg },
    ...msg,
  ];
  const functions = [
    {
      name: "get_current_weather",
      description: "Get the current weather or temperature in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA",
          },
          unit: { type: "string", enum: ["celsius", "fahrenheit"] },
        },
        required: ["location"],
      },
    },
    {
      name: "get_college_info",
      description: "Get the information of a college",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "name of the college",
          },
          majors: {
            type: "string",
            description: "the majors in the field of study ",
          },
        },
        required: ["college_name"],
      },
    },
    {
      name: "get_student_count",
      description: "Get the number of students in the college",
      parameters: {
        type: "object",
        properties: {
          department: {
            type: "string",
            description:
              "the Department must be the following values IT,COMP,ETC,MECH",
          },
          college: {
            type: "string",
            description: "name of the college",
          },
        },
        required: ["college"],
      },
    },
  ];

  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
      functions: functions,
      function_call: "auto",
    }),
  };

  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    requestOptions
  );
  const responseData = await response.json();
  //    / console.log(responseData);
  return responseData;
}

const generateresponse = async (incomingchatli, usermsg) => {
  const messageElement = incomingchatli.querySelector("p");

  try {
    const response = await run_conversation(usermsg);

    if (response && response.choices && response.choices.length > 0) {
      const assistantResponse = response.choices[0].message;

      console.log(response);

      if (assistantResponse.content == null) {
        //it has identified a function so content is null
        if (assistantResponse.function_call) {
          const availableFunctions = {
            get_current_weather: get_current_weather,
            get_college_info: get_college_info,
            get_student_count: get_student_count,
          };

          const functionName = assistantResponse.function_call.name;
          const functionToCall = availableFunctions[functionName];
          const functionArgs = JSON.parse(
            assistantResponse.function_call.arguments
          );
          // console.log(functionArgs)

          if (functionName == "get_current_weather") {
            const functionResponse = await functionToCall(
              functionArgs.location,
              functionArgs.unit
            );
            const variable = JSON.parse(functionResponse);
            // console.log(variable);

            messageElement.textContent = `temperature  is ${variable.temperature} ${variable.unit} in ${variable.location}`;
            msg.push({
              role: "assistant",
              content: messageElement.textContent,
            }); // Store assistant's response
          } else if (functionName == "get_college_info") {
            const functionResponse = await functionToCall(functionArgs.name);
            const variable = JSON.parse(functionResponse);
            // console.log(variable);
            messageElement.textContent = `My college is ${
              variable.name
            }. It is located in ${
              variable.location
            }. We offer majors in ${variable.majors.join(", ")}. ${
              variable.description
            }`;
            msg.push({
              role: "assistant",
              content: messageElement.textContent,
            }); // Store assistant's response
          } else if (functionName == "get_student_count") {
            const functionResponse = await functionToCall(
              functionArgs.college,
              functionArgs.department
            );
            const variable = JSON.parse(functionResponse);
            // console.log(variable);
            dept1 = functionArgs.department;
            // console.log(dept1);
            if (dept1) {
              if (dept1 === "COMP")
                messageElement.textContent = `${variable.college} has ${variable.COMPcount} students in ${variable.department} dept`;
              if (dept1 === "IT")
                messageElement.textContent = `${variable.college} has ${variable.ITcount} students in ${variable.department} dept`;
              if (dept1 === "MECH")
                messageElement.textContent = `${variable.college} has ${variable.MECHcount} students in ${variable.department} dept`;
              if (dept1 === "ECOMP")
                messageElement.textContent = `${variable.college} has ${variable.ETCcount} students in ${variable.department} dept`;
            } else
              messageElement.textContent = `${variable.college} has ${variable.count} students in total.`;

            msg.push({
              role: "assistant",
              content: messageElement.textContent,
            }); // Store assistant's response
          }
        }
        // else if... addtional
        else {
          messageElement.textContent =
            "Oops! The assistant's response is empty.";
        }
      } else if (assistantResponse !== null) {
        //func not called
        messageElement.textContent = assistantResponse.content;
      } else {
        messageElement.textContent = "Oops! The assistant's response is empty.";
      }
    }
    return response;
  } catch (error) {
    console.log(error);
    messageElement.textContent = "Oops! Please try again.";
  }
};

const createchatli = (message, className) => {
  const chatli = document.createElement("li");
  chatli.classList.add("chat", className);
  let chatcontent =
    className === "outgoing"
      ? `<p>${message}</p>`
      : `<span class="material-symbols-outlined">smart_toy</span><p>${message}</p>`;
  chatli.innerHTML = chatcontent;
  return chatli;
};

const handleChat = async () => {
  usermsg = chatinput.value.trim();
  if (!usermsg) return;

  chatbox.appendChild(createchatli(usermsg, "outgoing"));
  msg.push({ role: "user", content: usermsg });

  try {
    const incomingchatli = createchatli("thinking...", "incoming");
    chatbox.appendChild(incomingchatli);
    const response = await generateresponse(incomingchatli, usermsg);
    // console.log(response)
    if (response.choices[0].message.content != null) {
      msg.push({
        role: "assistant",
        content: response.choices[0].message.content,
      }); // Store assistant's response
    }
  } catch (error) {
    console.log(error);
    msg.push({ role: "system", content: "Oops! Please try again." }); // Store error message
  }
};

function displaymessages() {
  chatbox.innerHTML = "";
  for (const message of msg) {
    const role = message.role === "user" ? "outgoing" : "incoming";
    // console.log(message.content)
    chatbox.appendChild(createchatli(message.content, role));
  }
}
