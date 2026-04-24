



let revenueChartInstance = null;
let profitChartInstance = null;


document.addEventListener("submit", function (e) {

    if (e.target && e.target.id === "addUserForm") {

        e.preventDefault();

        console.log("STEP 1 ✅ SUBMIT CAPTURED");

        const form = e.target;
        const formData = new FormData(form);

        const mode = form.dataset.mode;
        const userId = form.dataset.userId;

        // 🔥 CHOOSE URL
        let url = "/panel/add-user/";

        if (mode === "edit" && userId) {
            url = `/panel/update-user/${userId}/`;
        }

        console.log("MODE:", mode);
        console.log("URL:", url);

        fetch(url, {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: formData
        })
        .then(res => {
            console.log("STEP 2 ✅ RESPONSE RECEIVED");
            return res.json();
        })
        .then(data => {

            console.log("DATA:", data);

            const alertBox = document.getElementById("alertBox");
            const alertMessage = document.getElementById("alertMessage");
            const alertIcon = document.getElementById("alertIcon");

            alertBox.classList.remove("hidden", "success", "error");

            if (data.success === true) {

                alertBox.classList.add("success", "show");

                // 🔥 MESSAGE DIFFERENT
                if (mode === "edit") {
                    alertMessage.textContent = data.message || "User updated successfully";
                } else {
                    alertMessage.textContent = data.message || "User created successfully";
                    form.reset(); // reset sèlman lè se add
                }

                alertIcon.className = "bx bx-check-circle";

            } else {

                alertBox.classList.add("error", "show");

                let firstError = "Something went wrong";

                if (data.errors) {
                    firstError = Object.values(data.errors)[0];
                } else if (data.error) {
                    firstError = data.error;
                }

                alertMessage.textContent = firstError;
                alertIcon.className = "bx bx-error-circle";
            }

            setTimeout(() => {
                alertBox.classList.remove("show");
            }, 4000);
        });
    }
});


function getCookie(name) {
    let cookieValue = null;

    if (document.cookie && document.cookie !== "") {
        const cookies = document.cookie.split(";");

        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();

            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }

    return cookieValue;
}


function initAddUserPage() {

    console.log("INIT ADD USER PAGE 🔥");

    // =====================
    // PHONE INPUT
    // =====================
    const phoneInput = document.querySelector("#phone");

    if (phoneInput) {
        window.intlTelInput(phoneInput, {
            initialCountry: "us",
            separateDialCode: true,
        });
    }

const container = document.getElementById("main-content");

if (!container) {
    console.log("NO MAIN CONTENT ❌");
    return;
}

const countrySelect = container.querySelector("#country");
const stateSelect = container.querySelector("#state");
const citySelect = container.querySelector("#city");

if (countrySelect) {

    fetch("https://countriesnow.space/api/v0.1/countries/positions")
    .then(res => res.json())
    .then(data => {

        countrySelect.innerHTML = `<option value="">Select Country</option>`;

        data.data.forEach(c => {
            let option = document.createElement("option");
            option.value = c.name;
            option.textContent = c.name;
            countrySelect.appendChild(option);
        });

        // 🔥 PREFILL COUNTRY APRE LOAD
 });
}

// =====================
// EVENTS
// =====================
if (countrySelect) {

    countrySelect.addEventListener("change", () => {

        const country = countrySelect.value;

        stateSelect.innerHTML = `<option value="">Select state</option>`;
        citySelect.innerHTML = `<option value="">Select city</option>`;

        stateSelect.disabled = true;
        citySelect.disabled = true;

        if (!country) return;

        fetch("https://countriesnow.space/api/v0.1/countries/states", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ country })
        })
        .then(res => res.json())
        .then(data => {

            stateSelect.disabled = false;

            data.data.states.forEach(s => {
                let option = document.createElement("option");
                option.value = s.name;
                option.textContent = s.name;
                stateSelect.appendChild(option);
            });
            // 🔥 PREFILL STATE
            if (selectedState) {
                stateSelect.value = selectedState;
                stateSelect.dispatchEvent(new Event("change"));
            }
        });
    });
}
if (stateSelect) {

    stateSelect.addEventListener("change", () => {

        const country = countrySelect.value;
        const state = stateSelect.value;

        citySelect.innerHTML = `<option value="">Select city</option>`;
        citySelect.disabled = true;

        if (!state) return;

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

    // =====================
    // ALERT CLOSE ONLY
    // =====================
    const closeBtn = document.getElementById("closeAlert");

    if (closeBtn) {
        closeBtn.onclick = () => {
            document.getElementById("alertBox").classList.remove("show");
        };
    }

}

function initCharts() {

    const revenueCanvas = document.getElementById('revenueChart');
    const profitCanvas = document.getElementById('profitChart');

    console.log("LABELS:", window.chartLabels);
console.log("REVENUE:", window.chartRevenue);
console.log("SHIPMENTS:", window.chartShipments);

    // 🔥 si pa sou dashboard → netwaye
    if (!revenueCanvas && !profitCanvas) {
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
            revenueChartInstance = null;
        }
        if (profitChartInstance) {
            profitChartInstance.destroy();
            profitChartInstance = null;
        }
        return;
    }

    // 🔥 SAFE DATA (evite crash)
    const labels = window.chartLabels || [];
    const revenue = window.chartRevenue || [];
    const shipments = window.chartShipments || [];

    console.log("Chart Data:", labels, revenue, shipments);

    // ===== REVENUE =====
    if (revenueCanvas) {

        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

        const ctx = revenueCanvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, "rgba(59,130,246,0.4)");
        gradient.addColorStop(1, "rgba(59,130,246,0)");

        revenueChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: "Revenue",
                    data: revenue,
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.45,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // ===== BAR CHART =====
    if (profitCanvas) {

        if (profitChartInstance) {
            profitChartInstance.destroy();
        }

        const ctx2 = profitCanvas.getContext('2d');

        profitChartInstance = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Shipments',
                        data: shipments,
                        backgroundColor: 'rgba(148, 163, 184, 0.5)'
                    },
                    {
                        label: 'Revenue',
                        data: revenue,
                        backgroundColor: '#3b82f6'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// =====================
// LOAD PAGE (CLEAN 🔥)
// =====================
function loadPage(url) {

    // 🔥 normalize URL (kenbe query string)
    const fullUrl = new URL(url, window.location.origin);
    url = fullUrl.pathname + fullUrl.search;

    console.log("LOADING:", url);

    fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.text())
    .then(data => {

        // 🔥 Parse HTML (pou charts sèlman)
        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // 🔥 Mete HTML (san parse body)
        document.getElementById('main-content').innerHTML = data;

        // 🔥 Rekipere chart data
        const labelsScript = doc.getElementById('labels-data');
        const revenueScript = doc.getElementById('revenue-data');
        const shipmentsScript = doc.getElementById('shipments-data');

        if (labelsScript) {
            window.chartLabels = JSON.parse(labelsScript.textContent);
            window.chartRevenue = JSON.parse(revenueScript.textContent);
            window.chartShipments = JSON.parse(shipmentsScript.textContent);
        }

        // 🔥 Update URL
        history.pushState(null, '', url);

        // 🔥 Active menu
        setActive(url);

        // 🔥 Relanse scripts
setTimeout(() => {
    initCharts();
    initAddUserPage();
}, 100);

    });
}

// =====================
// 🔥 GLOBAL CLICK (YON SEL)
// =====================
document.body.addEventListener("click", function(e) {

    const el = e.target.closest("[data-url]");
    if (!el) return;

    e.preventDefault();

    let url = el.getAttribute("data-url");

    loadPage(url);
});


// =====================
// ACTIVE MENU
// =====================
function setActive(url) {
    document.querySelectorAll('[data-url]').forEach(item => {
        item.classList.remove('active');

        if (item.getAttribute('data-url') === url) {
            item.classList.add('active');
        }
    });
}



// =====================
// BACK BUTTON
// =====================
window.addEventListener('popstate', () => {
    loadPage(window.location.pathname);
});

//========dark mode==========
const btn = document.querySelector(".light-dark");
const body = document.body;
const icon = document.getElementById("themeIcon");

// 🔁 APPLY THEME
function applyTheme(mode) {
    if (mode === "light") {
        body.classList.add("light-mode");

        icon.classList.remove("bxs-brightness-half");
        icon.classList.add("bxs-sun");
    } else {
        body.classList.remove("light-mode");

        icon.classList.remove("bxs-sun");
        icon.classList.add("bxs-brightness-half");
    }
}

// 🔁 LOAD SAVED THEME
let currentTheme = localStorage.getItem("theme") || "dark";
applyTheme(currentTheme);

// 🔁 CLICK EVENT
btn.addEventListener("click", () => {
    currentTheme = currentTheme === "dark" ? "light" : "dark";
    localStorage.setItem("theme", currentTheme);
    applyTheme(currentTheme);
});


//drop menu

const allItems = document.querySelectorAll(".nav_links > ul > li");
const dropdowns = document.querySelectorAll(".dwop_users");

// 🔁 CLICK MAIN ITEMS (san dropdown)
allItems.forEach(item => {
    item.addEventListener("click", function (e) {

        // si se dropdown, pa antre isit
        if (item.classList.contains("dwop_users")) return;

        // retire active sou tout
        document.querySelectorAll(".nav_links li").forEach(el => {
            el.classList.remove("active");
        });

        // mete active sou item la
        item.classList.add("active");
    });
});

// 🔁 CLICK DROPDOWN (open/close)
dropdowns.forEach(drop => {
    drop.addEventListener("click", function (e) {

        e.stopPropagation();

        // fèmen lòt dropdown yo
        dropdowns.forEach(d => {
            if (d !== drop) d.classList.remove("active");
        });

        // toggle aktyèl la
        drop.classList.toggle("active");
    });
});

// 🔁 CLICK SUBMENU ITEMS
document.querySelectorAll(".dwop_users ul li").forEach(sub => {
    sub.addEventListener("click", function (e) {

        e.stopPropagation();

        // retire active sou tout
        document.querySelectorAll(".nav_links li").forEach(el => {
            el.classList.remove("active");
        });

        // mete active sou submenu
        sub.classList.add("active");

        // mete active sou parent tou
        sub.closest(".dwop_users").classList.add("active");
    });
});





    // page without reload



// 🔥 CLICK EVENTS (SIDEBAR)
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function () {

            let url = this.getAttribute('data-url');
            loadPage(url);

        });
    });

});


// 🔥 ACTIVE MENU FUNCTION
function setActive(url) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');

        if (item.getAttribute('data-url') === url) {
            item.classList.add('active');
        }
    });
}

window.addEventListener('load', () => {

    let path = window.location.pathname;

    // 🔥 SI SE ROOT PAGE (/panel/)
    if (path === "/panel/" || path === "/panel") {
        setActive('/panel/dashboard/');

        // 🔥 FORCE CHART LOAD
      setTimeout(() => {
    initCharts();
    initAddUserPage();
    initDropdowns();
    // 🔥 AJOUTE SA
}, 100);

        return;
    }

    // 🔥 LOT PAGE
    loadPage(path);
});

// 🔥 BACK & FORWARD BUTTON SUPPORT
window.addEventListener('popstate', () => {
    loadPage(window.location.pathname);
});



function initDropdowns() {

    document.addEventListener('click', function (e) {

        const btn = e.target.closest('.more_btn');

        if (btn) {

            console.log("CLICKED"); // 🔥 test

            e.stopPropagation();

            const menu = btn.nextElementSibling;

            document.querySelectorAll('.dropdown_menu').forEach(m => {
                if (m !== menu) m.classList.remove('active');
            });

            if (menu) {
                menu.classList.toggle('active');
            }

            return;
        }

        document.querySelectorAll('.dropdown_menu').forEach(menu => {
            menu.classList.remove('active');
        });

    });

}

// 🔥 SA TE MANKE
initDropdowns();







// pagination for user tableau

document.addEventListener("submit", function (e) {

    const form = e.target;

    if (form.id === "searchForm") {

        e.preventDefault();

        const query = form.querySelector("input[name='q']").value.trim();

        console.log("SEARCH:", query);

        if (!query) {
            loadPage('/panel/users/');
            return;
        }

        loadPage(`/panel/users/?q=${encodeURIComponent(query)}`);
    }

});



// =====================
// 🔥 UPDATE COUNTER
// =====================
function updateSelectedCount() {

    const selected = document.querySelectorAll(".rowCheck:checked").length;
    const total = document.querySelectorAll(".rowCheck").length;

    const counter = document.getElementById("selectedCount");

    if (counter) {
        counter.textContent = `${selected} of ${total} selected`;

        if (selected > 0) {
            counter.classList.add("active");
        } else {
            counter.classList.remove("active");
        }
    }
}

// =====================
// 🔥 LIVE CHECKBOX UPDATE
// =====================
document.addEventListener("change", function(e) {

    if (e.target.classList.contains("rowCheck")) {
        updateSelectedCount();
    }
});




// =====================
// 🔥 DELETE USERS
// =====================

// =====================
// 🔥 SELECT ALL + SYNC
// =====================
document.addEventListener("change", function(e) {

    // 🔥 SELECT ALL
    if (e.target.id === "selectAll") {

        const checked = e.target.checked;

        document.querySelectorAll(".rowCheck").forEach(cb => {
            cb.checked = checked;
        });

        updateSelectedCount();
    }

    // 🔥 SI YON TI CHECKBOX CHANJE
    if (e.target.classList.contains("rowCheck")) {

        const all = document.querySelectorAll(".rowCheck");
        const checked = document.querySelectorAll(".rowCheck:checked");

        const selectAll = document.getElementById("selectAll");

        if (selectAll) {
            selectAll.checked = all.length === checked.length;
        }

        updateSelectedCount();
    }
});


document.addEventListener("click", function(e) {

    const deleteBtn = e.target.closest('[data-action="delete"]');

    if (deleteBtn) {

        // 🔥 jwenn row la
        const row = deleteBtn.closest("tr");

        if (!row) return;

        const userId = row.dataset.userId;

        const alertBox = document.getElementById("alertBox");
        const alertMessage = document.getElementById("alertMessage");
        const alertIcon = document.getElementById("alertIcon");

        fetch("/panel/delete-users/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: JSON.stringify({ user_ids: [userId] })
        })
        .then(res => res.json())
        .then(data => {

            if (data.success) {

                row.style.transition = "0.3s";
                row.style.opacity = "0";
                setTimeout(() => row.remove(), 300);

                updateSelectedCount();

                alertBox.classList.remove("hidden", "error");
                alertBox.classList.add("success", "show");

                alertMessage.textContent = "User deleted successfully";
                alertIcon.className = "bx bx-check-circle";

            } else {

                alertBox.classList.remove("hidden", "success");
                alertBox.classList.add("error", "show");

                alertMessage.textContent = "Error deleting user";
                alertIcon.className = "bx bx-error-circle";
            }

            setTimeout(() => alertBox.classList.remove("show"), 3000);
        });
    }
});