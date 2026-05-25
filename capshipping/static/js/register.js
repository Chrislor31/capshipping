


// 🔥 REGISTER ALERT
const loginError =
    document.getElementById("loginError");


// ✅ SHOW ALERT
function showLoginAlert(type, message){

    // RESET
    loginError.className =
        "form_error";

    // SHOW
    loginError.classList.remove(
        "hidden"
    );

    // TYPE
    loginError.classList.add(type);

    // ICON
    const icon =
        loginError.querySelector("i");

    if(type === "success"){

        icon.className =
            "bx bx-check-circle";

    }

    else{

        icon.className =
            "bx bx-error-circle";

    }

    // MESSAGE
    loginError
        .querySelector("span")
        .innerText = message;
}

// ==============================
// STEP FORM
// ==============================
const steps = document.querySelectorAll(".step");
const lines = document.querySelectorAll(".line");
const formSteps =
    document.querySelectorAll(
        "#multiForm .form-step"
    );
const nextBtns = document.querySelectorAll(".next-btn");
const prevBtns = document.querySelectorAll(".prev-btn");

let currentStep = 0;

// ==============================
// STEP 2 INIT (FIX)
// ==============================
function initStep2() {
  const country = document.getElementById("country");

  if (country && country.options.length <= 1) {
    loadCountries();
  }
}

// ==============================
// UPDATE UI
// ==============================
function updateSteps() {
  steps.forEach((step, index) => {
    if (index <= currentStep) {
      step.classList.add("active");
    } else {
      step.classList.remove("active");
    }
  });

  lines.forEach((line, index) => {
    if (index < currentStep) {
      line.classList.add("active");
    } else {
      line.classList.remove("active");
    }
  });

  formSteps.forEach((form, index) => {
    if (index === currentStep) {
      form.classList.add("active");

      // 🔥 FIX STEP 2
      if (index === 1) {
        setTimeout(() => {
          initStep2();
        }, 100);
      }

    } else {
      form.classList.remove("active");
    }
  });
}

// NEXT
nextBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep < formSteps.length - 1) {
      currentStep++;
      updateSteps();
    }
  });
});

// BACK
prevBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      updateSteps();
    }
  });
});

// CLICK ON STEP
steps.forEach((step, index) => {
  step.addEventListener("click", () => {
    currentStep = index;
    updateSteps();
  });
});

// INIT
updateSteps();


// ==============================
// PHONE INPUT
// ==============================
const phoneInput = document.querySelector("#phone");

const iti = window.intlTelInput(phoneInput, {
  initialCountry: "ht",
  separateDialCode: true,

  geoIpLookup: function(callback) {
    fetch("https://ipapi.co/json")
      .then(res => res.json())
      .then(data => callback(data.country_code))
      .catch(() => callback("US"));
  },

  utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"
});


document.addEventListener("DOMContentLoaded", function () {

  const countrySelect = document.getElementById("country");
  const stateSelect = document.getElementById("state");
  const citySelect = document.getElementById("city");

  let countriesLoaded = false;

  // ==============================
  // LOAD COUNTRIES (API)
  // ==============================
  function loadCountries() {
    if (countriesLoaded) return;

    fetch("https://restcountries.com/v3.1/all?fields=name")
      .then(res => res.json())
      .then(data => {

        // 🔥 RESET SELECT
        countrySelect.innerHTML = "";

        // 🔥 PLACEHOLDER
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "Select Country";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        defaultOption.hidden = true;
        countrySelect.appendChild(defaultOption);

        // 🔥 COUNTRIES
        data
          .sort((a, b) => a.name.common.localeCompare(b.name.common))
          .forEach(country => {
            const option = document.createElement("option");
            option.value = country.name.common;
            option.textContent = country.name.common;
            countrySelect.appendChild(option);
          });

        countriesLoaded = true;
      })
      .catch(() => {
        console.error("Error loading countries");
      });
  }

  // ==============================
  // LOAD STATES
  // ==============================
  function loadStates(country) {

    stateSelect.innerHTML = "";
    citySelect.innerHTML = "";

    // STATE placeholder
    const stateDefault = document.createElement("option");
    stateDefault.value = "";
    stateDefault.textContent = "Select State";
    stateDefault.disabled = true;
    stateDefault.selected = true;
    stateDefault.hidden = true;
    stateSelect.appendChild(stateDefault);

    // CITY placeholder
    const cityDefault = document.createElement("option");
    cityDefault.value = "";
    cityDefault.textContent = "Select City";
    cityDefault.disabled = true;
    cityDefault.selected = true;
    cityDefault.hidden = true;
    citySelect.appendChild(cityDefault);

    stateSelect.disabled = true;
    citySelect.disabled = true;

    fetch("https://countriesnow.space/api/v0.1/countries/states", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ country: country })
    })
      .then(res => res.json())
      .then(data => {

        data.data.states.forEach(state => {
          const option = document.createElement("option");
          option.value = state.name;
          option.textContent = state.name;
          stateSelect.appendChild(option);
        });

        stateSelect.disabled = false;
      })
      .catch(() => {
        stateSelect.innerHTML = "<option>Error loading states</option>";
      });
  }

  // ==============================
  // LOAD CITIES
  // ==============================
  function loadCities(country, state) {

    citySelect.innerHTML = "";

    const cityDefault = document.createElement("option");
    cityDefault.value = "";
    cityDefault.textContent = "Select City";
    cityDefault.disabled = true;
    cityDefault.selected = true;
    cityDefault.hidden = true;
    citySelect.appendChild(cityDefault);

    citySelect.disabled = true;

    fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ country, state })
    })
      .then(res => res.json())
      .then(data => {

        data.data.forEach(city => {
          const option = document.createElement("option");
          option.value = city;
          option.textContent = city;
          citySelect.appendChild(option);
        });

        citySelect.disabled = false;
      })
      .catch(() => {
        citySelect.innerHTML = "<option>Error loading cities</option>";
      });
  }

  // ==============================
  // EVENTS
  // ==============================
  countrySelect.addEventListener("change", () => {
    const country = countrySelect.value;

    if (country) {
      loadStates(country);
    }
  });

  stateSelect.addEventListener("change", () => {
    const country = countrySelect.value;
    const state = stateSelect.value;

    if (state) {
      loadCities(country, state);
    }
  });

  // INIT
  loadCountries();

});





document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("multiForm");

    form.addEventListener("submit", async function (e) {
        e.preventDefault();

        // 🧹 clear old errors
        document.querySelectorAll(".error-message").forEach(el => {
            el.innerText = "";
            el.classList.remove("active");
        });

        document.querySelectorAll("input, select").forEach(el => {
            el.classList.remove("input-error");
        });

        const password = form.querySelector('[name="password"]').value;
        const confirmPassword = form.querySelector('[name="confirm_password"]').value;

        // 🔥 password min length
        if (password.length < 8) {
            showError("password", "Password must be at least 8 characters");
            goToStepWithError("password");
            return;
        }

        // 🔥 password match
        if (password !== confirmPassword) {
            showError("confirm_password", "Passwords do not match");
            goToStepWithError("confirm_password");
            return;
        }


// 🔥 FULL PHONE
const rawPhone =

phoneInput.value
.replace(/\D/g, "");


const fullPhone =

"+" +

iti.getSelectedCountryData()
.dialCode +

rawPhone;


console.log(fullPhone);
        const data = {
            email: form.querySelector('[name="email"]').value,
            password: password,
            first_name: form.querySelector('[name="first_name"]').value,
            last_name: form.querySelector('[name="last_name"]').value,
            phone_number: fullPhone,
            country: form.querySelector('[name="country"]').value,
            state: form.querySelector('[name="state"]').value,
            city: form.querySelector('[name="city"]').value,
            full_address: form.querySelector('[name="full_address"]').value,
            default_pickup_warehouse: form.querySelector('[name="Delevery_city"]').value
        };

        try {
            const response = await fetch("/api/register/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken(),
                },
                body: JSON.stringify(data)
            });

            let resData;

            // 🔥 safe JSON parse
            try {
                resData = await response.json();
            } catch (e) {
                console.error("Server returned HTML instead of JSON (500 error)");
                return;
            }

            console.log(resData);


// ❌ BACKEND ERRORS
if (!response.ok) {

    for (let field in resData) {

        let messages = resData[field];

        let messageText =
            Array.isArray(messages)
            ? messages.join(", ")
            : messages;

        // 🔥 SHOW RED ALERT
        showLoginAlert(
            "error",
            messageText
        );

        // 🔥 GO TO STEP
        goToStepWithError(field);
    }

    return;
}


// ✅ SUCCESS
showLoginAlert(
    "success",
    "Account created successfully. Sending verification code..."
);


// 🔥 SAVE EMAIL
window.registerEmail =
    resData.email;


// ⏳ WAIT
setTimeout(() => {

    // OTP FLOW
    document.getElementById(
        "multiForm"
    ).style.display = "none";

    document.getElementById(
        "otpStep"
    ).style.display = "block";

}, 1600);

        } catch (error) {
            console.error("Network error:", error);
        }

    });

});


// 🔥 show error
function showError(fieldName, message) {

    if (fieldName === "default_pickup_warehouse") {
        fieldName = "Delevery_city";
    }

    const input = document.querySelector(`[name="${fieldName}"]`);
    const error = document.getElementById(fieldName + "-error");

    if (input) {
        input.classList.add("input-error");
    }

    if (error) {
        error.innerText = message;
        error.classList.add("active");
    }
}


// 🔥 go to correct step
function goToStepWithError(fieldName) {

    if (["email", "password", "confirm_password", "first_name", "last_name", "phone_number"].includes(fieldName)) {
        showStep(0);
    }
    else if (["country", "state", "city", "full_address"].includes(fieldName)) {
        showStep(1);
    }
    else if (["Delevery_city"].includes(fieldName)) {
        showStep(2);
    }
}


// 🔥 FIX: showStep function (te manke)
// 🔥 FIX STEP SYSTEM
function showStep(index) {

    currentStep = index;

    updateSteps();

}


// CSRF
function getCSRFToken() {
    let cookieValue = null;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
        cookie = cookie.trim();
        if (cookie.startsWith('csrftoken=')) {
            cookieValue = cookie.substring('csrftoken='.length);
        }
    }
    return cookieValue;
}


// ==========================
// MESSAGE FUNCTIONS (OBLIGATWA - anlè)
// ==========================

function showOtpError(message){
    const el = document.getElementById("otp-error");

    if(el){
        el.innerText = message;
        el.style.display = "block";
        el.style.color = "#dc2626"; // 🔴 red
    }
}

function showOtpSuccess(message){
    const el = document.getElementById("otp-error");

    if(el){
        el.innerText = message;
        el.style.display = "block";
        el.style.color = "#16a34a"; // 🟢 green
    }
}

// 🔥 CSRF
function getCSRFToken(){
    return document.querySelector('[name=csrfmiddlewaretoken]').value;
}


// ==========================
// MAIN SCRIPT
// ==========================

document.addEventListener("DOMContentLoaded", function(){

    const btn = document.getElementById("verifyRegisterOtp");
    const resendBtn = document.getElementById("resendOtp");
    const otpInputs = document.querySelectorAll(".otp");

    // ==========================
    // OTP INPUT FIX
    // ==========================

    otpInputs.forEach((input, i) => {

        input.addEventListener("input", (e) => {

            let value = e.target.value;

            if (value.length > 1) {
                let digits = value.replace(/\D/g, "").split("");

                otpInputs.forEach((box, index) => {
                    box.value = digits[index] || "";
                });

                otpInputs[Math.min(digits.length, otpInputs.length) - 1].focus();
                return;
            }

            value = value.replace(/\D/g, "");
            input.value = value;

            if (value !== "" && i < otpInputs.length - 1) {
                otpInputs[i + 1].focus();
            }

        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace" && input.value === "" && i > 0) {
                otpInputs[i - 1].focus();
            }
        });

    });


    // ==========================
    // RESEND OTP
    // ==========================

    if(resendBtn){
        resendBtn.addEventListener("click", function(){

            showOtpError("Sending new code... ⏳");

            fetch("/resend-register-otp/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify({
                    email: window.registerEmail
                })
            })
            .then(res => res.json())
            .then(data => {

                if(data.status === "success"){

                    showOtpSuccess("New code sent to your email ✅");

                    otpInputs.forEach(input => input.value = "");
                    otpInputs[0].focus();

                }else{
                    showOtpError(data.message || "Error ❌");
                }
            });

        });
    }


    // ==========================
    // VERIFY OTP
    // ==========================

    if(btn){
        btn.addEventListener("click", function(){

            const otp = [...otpInputs].map(i => i.value).join("");

            if(otp.length < 6){
                showOtpError("Enter full code ❌");
                return;
            }

            fetch("/verify-register-otp/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": getCSRFToken()
                },
                body: JSON.stringify({
                    email: window.registerEmail,
                    otp: otp
                })
            })
            .then(res => res.json())
            .then(data => {

                if(data.status === "success"){

                    showOtpSuccess("Code verified ✅");

                    setTimeout(()=>{
                        window.location.href = "/dashboard/";
                    },1000);

                }else{
                    showOtpError(data.message || "Invalid code ❌");
                }
            });

        });
    }

});