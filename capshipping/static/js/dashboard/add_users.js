function initAddUserPage() {

    // =====================
    // 📱 PHONE INPUT
    // =====================
    const phoneInput = document.querySelector("#phone");

    if (phoneInput) {
        window.intlTelInput(phoneInput, {
            initialCountry: "us",
            separateDialCode: true,

            geoIpLookup: function(callback) {
                fetch("https://ipapi.co/json")
                    .then(res => res.json())
                    .then(data => callback(data.country_code))
                    .catch(() => callback("US"));
            },

            utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js"
        });
    }

    // =====================
    // 🌍 COUNTRY SYSTEM
    // =====================
    const countrySelect = document.getElementById("country");
    const stateSelect = document.getElementById("state");
    const citySelect = document.getElementById("city");

    if (!countrySelect) return;

    fetch("https://countriesnow.space/api/v0.1/countries/positions")
    .then(res => res.json())
    .then(data => {
        countrySelect.innerHTML = `<option disabled selected>Select Country</option>`;

        data.data.forEach(country => {
            let option = document.createElement("option");
            option.value = country.name;
            option.textContent = country.name;
            countrySelect.appendChild(option);
        });
    });

    countrySelect.addEventListener("change", () => {
        let country = countrySelect.value;

        stateSelect.innerHTML = "<option>Select state</option>";
        citySelect.innerHTML = "<option>Select city</option>";
        stateSelect.disabled = true;
        citySelect.disabled = true;

        fetch("https://countriesnow.space/api/v0.1/countries/states", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ country })
        })
        .then(res => res.json())
        .then(data => {
            stateSelect.disabled = false;

            data.data.states.forEach(state => {
                let option = document.createElement("option");
                option.value = state.name;
                option.textContent = state.name;
                stateSelect.appendChild(option);
            });
        });
    });

    stateSelect.addEventListener("change", () => {
        let country = countrySelect.value;
        let state = stateSelect.value;

        citySelect.innerHTML = "<option>Select city</option>";
        citySelect.disabled = true;

        fetch("https://countriesnow.space/api/v0.1/countries/state/cities", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ country, state })
        })
        .then(res => res.json())
        .then(data => {
            citySelect.disabled = false;

            data.data.forEach(city => {
                let option = document.createElement("option");
                option.value = city;
                option.textContent = city;
                citySelect.appendChild(option);
            });
        });
    });

}