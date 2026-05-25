

function safeInit(fn, name) {
    try {
        if (typeof fn === "function") {
            fn();
        }
    } catch (e) {
        console.error(name + " crashed:", e);
    }
}


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

    const form = document.getElementById("addUserForm");
    if (!form) return; // 🔥 PA SOU PAGE LA → STOP

    console.log("INIT ADD USER PAGE 🔥");

    // =====================
    // PHONE INPUT
    // =====================
    const phoneInput = document.querySelector("#phone");

    if (phoneInput && !phoneInput.dataset.init) {
        window.intlTelInput(phoneInput, {
            initialCountry: "us",
            separateDialCode: true,
        });

        phoneInput.dataset.init = "true"; // 🔥 evite double init
    }

    const container = document.getElementById("main-content");
    if (!container) return;

    const countrySelect = container.querySelector("#country");
    const stateSelect = container.querySelector("#state");
    const citySelect = container.querySelector("#city");

    // =====================
    // LOAD COUNTRIES
    // =====================
    if (countrySelect && !countrySelect.dataset.loaded) {

        fetch("https://countriesnow.space/api/v0.1/countries/positions")
        .then(res => res.json())
        .then(data => {

            countrySelect.innerHTML = `<option value="">Select Country</option>`;

            data.data.forEach(c => {
                const option = document.createElement("option");
                option.value = c.name;
                option.textContent = c.name;
                countrySelect.appendChild(option);
            });

            countrySelect.dataset.loaded = "true"; // 🔥 evite reload
        })
        .catch(err => console.error("Country load error:", err));
    }

    // =====================
    // COUNTRY CHANGE
    // =====================
    if (countrySelect && !countrySelect.dataset.event) {

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
                    const option = document.createElement("option");
                    option.value = s.name;
                    option.textContent = s.name;
                    stateSelect.appendChild(option);
                });

            })
            .catch(err => console.error("State load error:", err));

        });

        countrySelect.dataset.event = "true";
    }

    // =====================
    // STATE CHANGE
    // =====================
    if (stateSelect && !stateSelect.dataset.event) {

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
                    const option = document.createElement("option");
                    option.value = city;
                    option.textContent = city;
                    citySelect.appendChild(option);
                });

            })
            .catch(err => console.error("City load error:", err));

        });

        stateSelect.dataset.event = "true";
    }

    // =====================
    // ALERT CLOSE
    // =====================
    const closeBtn = document.getElementById("closeAlert");

    if (closeBtn && !closeBtn.dataset.event) {
        closeBtn.addEventListener("click", () => {
            document.getElementById("alertBox")?.classList.remove("show");
        });

        closeBtn.dataset.event = "true";
    }

}

// ===== initcharts===

function initCharts() {

    const revenueCanvas = document.getElementById('revenueChart');
    const profitCanvas = document.getElementById('profitChart');

    // 🔥 si pa sou dashboard → destroy + stop
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

    // 🔥 verify Chart.js egziste
    if (typeof Chart === "undefined") {
        console.error("Chart.js pa load ❌");
        return;
    }

    // 🔥 SAFE DATA
    const labels = Array.isArray(window.chartLabels) ? window.chartLabels : [];
    const revenue = Array.isArray(window.chartRevenue) ? window.chartRevenue : [];
    const shipments = Array.isArray(window.chartShipments) ? window.chartShipments : [];

    console.log("Chart Data:", labels, revenue, shipments);

    // =====================
    // REVENUE LINE CHART
    // =====================
    if (revenueCanvas) {

        const ctx = revenueCanvas.getContext('2d');
        if (!ctx) return;

        // 🔥 destroy old
        if (revenueChartInstance) {
            revenueChartInstance.destroy();
        }

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

    // =====================
    // BAR CHART
    // =====================
    if (profitCanvas) {

        const ctx2 = profitCanvas.getContext('2d');
        if (!ctx2) return;

        // 🔥 destroy old
        if (profitChartInstance) {
            profitChartInstance.destroy();
        }

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





function initPage() {

    console.log("INIT PAGE GLOBAL");

    // 🔥 helper pou evite crash si fonksyon pa egziste
    function run(fn, name){
        try{
            if (typeof fn === "function"){
                fn();
                console.log("✅ INIT:", name);
            } else {
                console.log("⛔ SKIP:", name);
            }
        }catch(e){
            console.error("❌ ERROR in", name, e);
        }
    }

    // =====================
    // 🔥 GLOBAL SAFE MODULES
    // =====================
    run(window.initDropdowns, "Dropdowns");

    // =====================
    // 🔥 DASHBOARD (Charts)
    // =====================
    if (document.getElementById("revenueChart") || document.getElementById("profitChart")){
        run(window.initCharts, "Charts");
    }

    // =====================
    // 🔥 USERS PAGE
    // =====================
    if (document.querySelector(".users_page") || document.getElementById("usersTable")){
        run(window.initUsersPage, "Users");
    }

    // =====================
    // 🔥 ADD USER PAGE
    // =====================
    if (document.getElementById("addUserForm")){
        run(window.initAddUserPage, "AddUser");
    }

    // =====================
    // 🔥 SHIPMENTS PAGE
    // =====================
        if (document.querySelector(".shipment_packages") || document.querySelector(".shipment_manage")){
    run(window.initShipmentsPage, "Shipments");
}
    // =====================
    // 🔥 CONTACT MODULE
    // =====================
    if (document.querySelector(".add_contact")){
        run(window.initContactModule, "Contact");
    }

    // =====================
// 🔥 ADD SHIPMENT PAGE
// =====================
if (document.querySelector(".left_content_add")){
    run(window.initUserModule, "UserModule");
    run(window.initSenderReceiver, "SenderReceiver");
}

if (document.getElementById("userSearchBox")){
    run(window.initUserModule, "UserModule");
}

if (document.getElementById("shipmentForm")){
    run(window.initShipmentSubmit, "ShipmentSubmit");
}


}



// =====================================
// PAGE LOADER
// =====================================

function showPageLoader(){

    const container =
    document.getElementById(
        "main-content"
    );

    if(!container) return;



    container.innerHTML = `

        <div class="page_state loading_state">

            <div class="spinner_loader"></div>

            <h3>Loading...</h3>

        </div>

    `;
}



// =====================================
// PAGE ERROR
// =====================================

function showPageError(url){

    const container =
    document.getElementById(
        "main-content"
    );

    if(!container) return;



    container.innerHTML = `

        <div class="page_state error_state">

            <i class='bx bx-error-circle'></i>

            <h2>Couldn't load</h2>

            <p>

                Something went wrong fetching this data.

            </p>

            <button
                onclick="loadPage('${url}')"
            >

                Retry

            </button>

        </div>

    `;
}



// =====================================
// LOAD PAGE
// =====================================

async function loadPage(url){

    const container =
    document.getElementById(
        "main-content"
    );



    if(!container) return;



    // 🔥 SAVE OLD CONTENT
    const oldContent =
    container.innerHTML;



    // =====================================
    // URL
    // =====================================

    const fullUrl =
    new URL(

        url,

        window.location.origin

    );



    url =
    fullUrl.pathname +
    fullUrl.search;



    console.log(
        "LOADING:",
        url
    );



    // =====================================
    // LOADER
    // =====================================

    showPageLoader();



    try{

        // =====================================
        // FETCH
        // =====================================

        const response =
        await fetch(

            url,

            {

                headers: {

                    "X-Requested-With":
                    "XMLHttpRequest"

                }

            }

        );



        // =====================================
        // BAD RESPONSE
        // =====================================

        if(!response.ok){

            throw new Error(
                `HTTP ${response.status}`
            );

        }



        // =====================================
        // HTML DATA
        // =====================================

        const data =
        await response.text();



        // =====================================
        // EMPTY RESPONSE
        // =====================================

        if(

            !data ||

            !data.trim()

        ){

            throw new Error(
                "Empty response"
            );

        }



        // =====================================
        // PARSE HTML
        // =====================================

        const parser =
        new DOMParser();



        const doc =
        parser.parseFromString(

            data,

            "text/html"

        );



        // =====================================
        // INJECT HTML
        // =====================================

        container.innerHTML =
        doc.body.innerHTML;


        // 🔥 RELOAD SCRIPTS

doc.querySelectorAll("script").forEach(oldScript => {

    const newScript =
    document.createElement("script");

    if (oldScript.src){

        newScript.src =
        oldScript.src;

    } else {

        newScript.textContent =
        oldScript.textContent;

    }

    document.body.appendChild(
        newScript
    );

});



        // =====================================
        // SAFE JSON
        // =====================================

        function safeJSON(script){

            try{

                if(!script) return [];



                const txt =
                script.textContent?.trim();



                if(!txt) return [];



                return JSON.parse(txt);

            }

            catch(err){

                console.log(
                    "JSON parse skipped"
                );

                return [];

            }

        }



        // =====================================
        // CHART DATA
        // =====================================

        window.chartLabels =
        safeJSON(
            doc.getElementById(
                "labels-data"
            )
        );



        window.chartRevenue =
        safeJSON(
            doc.getElementById(
                "revenue-data"
            )
        );



        window.chartShipments =
        safeJSON(
            doc.getElementById(
                "shipments-data"
            )
        );



        // =====================================
        // UPDATE URL
        // =====================================

        history.pushState(

            null,

            "",

            url

        );



        // =====================================
        // ACTIVE MENU
        // =====================================

        setActive(url);



        // =====================================
        // INIT PAGE
        // =====================================

        initPage();



        // =====================================
        // EXTRA MODULES
        // =====================================

        if(typeof loadTracking === "function"){

            loadTracking();

        }



        if(typeof initPaymentToggle === "function"){

            initPaymentToggle();

        }



        if(typeof initDeleteShipment === "function"){

            initDeleteShipment();

        }

    }

    catch(err){

        console.error(
            "Load page error:",
            err
        );



        // =====================================
        // RESTORE OLD PAGE
        // =====================================

        window.location.reload();



        // 🔥 OPTIONAL
        // showPageError(url);

    }

}


// =====================
// ACTIVE MENU
// =====================
function setActive(url) {

    const items = document.querySelectorAll('[data-url]');
    if (!items.length) return;

    items.forEach(item => {
        item.classList.remove('active');

        const itemUrl = item.getAttribute('data-url');
        if (!itemUrl) return;

        if (url.startsWith(itemUrl)) {
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


function initUsersPage() {

    const table = document.querySelector(".users_table");
    if (!table) return; // 🔥 pa sou users page

    console.log("INIT USERS PAGE");

    // =====================
    // 🔥 DELETE USER
    // =====================
    document.addEventListener("click", function(e) {

        const deleteBtn = e.target.closest('[data-action="delete"]');
        if (!deleteBtn) return;

        const row = deleteBtn.closest("tr");
        if (!row) return;

        const userId = row.dataset.userId;

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

                showAlert("User deleted successfully", "success");

            } else {
                showAlert("Error deleting user", "error");
            }
        });
    });


    // =====================
    // 🔥 VIEW DETAILS
    // =====================
    document.addEventListener("click", function(e) {

        const btn = e.target.closest('[data-action="view"]');
        if (!btn) return;

        const userId = btn.dataset.userId;

        loadPage(`/panel/user-details/${userId}/`);
    });

}


document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', function (e) {

            const url = this.getAttribute('data-url');
            if (!url) return;

            e.preventDefault(); // 🔥 ENPÒTAN
            e.stopPropagation(); // 🔥 evite double click

            loadPage(url);

        });
    });

});
// 🔥 ACTIVE MENU
function setActive(url) {

    const items = document.querySelectorAll('.nav-item');
    if (!items.length) return;

    items.forEach(item => {
        item.classList.remove('active');

        const itemUrl = item.getAttribute('data-url');
        if (!itemUrl) return;

        if (url.startsWith(itemUrl)) {
            item.classList.add('active');
        }
    });
}


// 🔥 PAGE LOAD
window.addEventListener('load', () => {

    let path = window.location.pathname;

    // 🔥 DEFAULT DASHBOARD
    if (path === "/panel/" || path === "/panel") {
        path = "/panel/dashboard/";
    }

    setActive(path);

    // 🔥 LOAD PAGE SPA
    loadPage(path);
});


// 🔥 BACK / FORWARD
window.addEventListener('popstate', () => {
    loadPage(window.location.pathname);
});
function initDropdowns() {

    if (document.body.dataset.dropdownInit) return;

    document.addEventListener('click', function (e) {

        const btn = e.target.closest('.more_btn');

        if (btn) {

            e.stopPropagation();

            const menu = btn.nextElementSibling;
            if (!menu) return;

            document.querySelectorAll('.dropdown_menu').forEach(m => {
                if (m !== menu) m.classList.remove('active');
            });

            menu.classList.toggle('active');
            return;
        }

        document.querySelectorAll('.dropdown_menu').forEach(menu => {
            menu.classList.remove('active');
        });

    });

    document.body.dataset.dropdownInit = "true";
}






// =====================
// 🔥 INIT SHIPMENTS PAGE
// =====================
function initShipmentsPage(){

    const table = document.querySelector(".shipment_packages");
    if (!table) {
        console.log("⛔ NOT SHIPMENT PAGE");
        return;
    }

    console.log("✅ INIT SHIPMENTS PAGE");

    // 🔥 ACTION DROPDOWN CLICK (VIEW / EDIT)
    table.addEventListener("click", function(e){

        const item = e.target.closest(".dropdown_item");
        if (!item) return;

        const url = item.getAttribute("data-url");

        if (url){
            e.preventDefault();
            loadPage(url);
        }
    });

}



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


document.addEventListener("DOMContentLoaded", function(){

let deleteTargetRows = [];
let deleteUserIds = [];

// =====================
// 🧠 CSRF
// =====================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith(name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// =====================
// 🔓 OPEN MODAL
// =====================
function openDeleteModal(rows, ids){

    deleteTargetRows = rows;
    deleteUserIds = ids;

    const modal = document.getElementById("deleteModal");
    const msg = document.getElementById("deleteMessage");

    if (!modal) {
        console.error("❌ Modal not found");
        return;
    }

    if (ids.length === 1){
        msg.innerText = "Are you sure you want to delete this user?";
    } else {
        msg.innerText = `Are you sure you want to delete ${ids.length} users?`;
    }

    modal.classList.remove("hidden");
}

// =====================
// 🔒 CLOSE MODAL
// =====================
function closeDeleteModal(){
    document.getElementById("deleteModal")?.classList.add("hidden");
    deleteTargetRows = [];
    deleteUserIds = [];
}

// =====================
// 🎯 ONE CLICK HANDLER
// =====================
document.addEventListener("click", function(e){

    // 🔥 SINGLE DELETE (dropdown)
    const singleDelete = e.target.closest('[data-action="delete"]');
    if (singleDelete){

        const row = singleDelete.closest("tr");
        if (!row) return;

        const userId = row.dataset.userId;

        console.log("🗑️ single:", userId);

        openDeleteModal([row], [userId]);
        return;
    }

    // 🔥 BULK DELETE (button)
    const bulkDelete = e.target.closest("#deleteSelected");
    if (bulkDelete){

        console.log("🔥 bulk click");

        const checked = document.querySelectorAll(".rowCheck:checked");

        if (checked.length === 0){
            alert("Select at least one user");
            return;
        }

        let rows = [];
        let ids = [];

        checked.forEach(cb => {
            const row = cb.closest("tr");
            if (row){
                rows.push(row);
                ids.push(cb.value);
            }
        });

        console.log("🗑️ bulk:", ids);

        openDeleteModal(rows, ids);
        return;
    }

    // ❌ CANCEL
    if (e.target.id === "cancelDelete"){
        closeDeleteModal();
    }

    // ❌ CLICK OUTSIDE
    if (e.target.id === "deleteModal"){
        closeDeleteModal();
    }

});

// =====================
// ❌ CONFIRM DELETE
// =====================
document.getElementById("confirmDelete")?.addEventListener("click", function(){

    if (deleteUserIds.length === 0){
        console.warn("❌ nothing to delete");
        return;
    }

    fetch("/panel/delete-users/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        },
        body: JSON.stringify({ user_ids: deleteUserIds })
    })
    .then(res => res.json())
    .then(data => {

        if (data.success){

            deleteTargetRows.forEach(row => {
                row.style.opacity = "0";
                setTimeout(() => row.remove(), 300);
            });

            updateSelectedCount?.();
        }

        closeDeleteModal();
    })
    .catch(() => closeDeleteModal());

});

});



// click button to url ///



    document.addEventListener("click", function(e){

    const btn = e.target.closest("[data-url]");

    if (btn){

        const url = btn.getAttribute("data-url");

        if (!url) return;

        console.log("🚀 loading:", url);

        // 🔥 si w gen loadPage()
        if (typeof loadPage === "function"){
            loadPage(url);
        } else {
            // fallback si pa SPA
            window.location.href = url;
        }

    }

});



document.addEventListener("click", function(e){

    const btn = e.target.closest("[data-print-url]");

    if (btn){
        const url = btn.dataset.printUrl;

        if (!url){
            alert("Shipment not ready yet");
            return;
        }

        const win = window.open(url, "_blank");

        win.onload = function(){
            win.print();
        };
    }

});


// ===============================
// 🔥 FULL TRACKING JS (ADMIN)
// ===============================
function loadTracking(){

    const container = document.querySelector(".tracking_timeline");
    if (!container) return;

    const trackingNumber = container.dataset.tracking;

    container.innerHTML = "<p style='color:#999'>Loading...</p>";

    fetch(`/api/admin-track/?tracking_number=${trackingNumber}`)
    .then(res => res.json())
    .then(data => {

        if(!data.success){
            container.innerHTML = `<p style="color:red">${data.error}</p>`;
            return;
        }

        container.innerHTML = "";

        // 🔥 jwenn current step (dènye done)
        let lastDoneIndex = -1;

        data.timeline.forEach((item, i) => {
            if(item.done) lastDoneIndex = i;
        });

        data.timeline.forEach((item, index) => {

            const isLast = index === data.timeline.length - 1;
            const isActive = item.done;
            const isCurrent = index === lastDoneIndex;

            const html = `
            <div class="timeline_item ${isLast ? 'last' : ''}
                ${isActive ? 'active' : ''}
                ${isCurrent ? 'current' : ''}">

                <div class="timeline_left">
                    <div class="dot">
                        <i class='bx bx-check'></i>
                    </div>
                </div>

                <div class="timeline_content">
                    <h5>${item.status}</h5>
                    ${item.warehouse ? `<p>${item.warehouse}</p>` : ""}
                </div>

                <div class="timeline_date">
                    ${item.date ? `<p>${item.date}</p>` : ""}
                    ${item.time ? `<span>${item.time}</span>` : ""}
                </div>

            </div>
            `;

            container.insertAdjacentHTML("beforeend", html);
        });

    });
}



//=====update shipment



document.addEventListener("submit", function(e){

    const form = e.target;

    if(form.id !== "shipmentForm") return;

    e.preventDefault();

    const formData = new FormData(form);

    const shipmentId = form.dataset.id; // 🔥 enpòtan pou edit

    const url = shipmentId
        ? `/api/update-shipment/${shipmentId}/`
        : `/api/create-shipment/`;

    fetch(url, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCookie("csrftoken")
        },
        body: formData
    })
    .then(res => res.json())
    .then(data => {

        if(data.success || data.tracking){

            console.log("SUCCESS:", data);

            // 🔥 update summary (right panel)
            document.getElementById("sum_tracking").innerText = data.tracking || "";
            document.getElementById("sum_pkg").innerText = data.pkg || "";
            document.getElementById("sum_price").innerText = "$" + (data.price || 0);

        } else {
            console.error(data);
        }

    })
    .catch(err => console.error(err));

});

// =======================
// 🔥 GLOBAL STATE
// =======================
let deleteTargetRows = [];
let deleteUrls = [];


// =======================
// 🔓 OPEN MODAL
// =======================
function openDeleteModal(rows, urls){

    deleteTargetRows = rows;
    deleteUrls = urls;

    const modal = document.getElementById("deleteModal");
    const msg = document.getElementById("deleteMessage");

    if (!modal) return;

    if (urls.length === 1){
        msg.innerText = "Are you sure you want to delete this shipment?";
    } else {
        msg.innerText = `Are you sure you want to delete ${urls.length} shipments?`;
    }

    modal.classList.remove("hidden");
}


// =======================
// 🔒 CLOSE MODAL
// =======================
function closeDeleteModal(){

    const modal = document.getElementById("deleteModal");

    if (modal){
        modal.classList.add("hidden");
    }

    deleteTargetRows = [];
    deleteUrls = [];
}


// =======================
// 🎯 CLICK HANDLER
// =======================
document.addEventListener("click", function(e){

    // ===================
    // 🔥 SINGLE DELETE
    // ===================
    const singleDelete = e.target.closest('[data-action="delete"]');

    if (singleDelete){

        const row = singleDelete.closest("tr");
        const url = singleDelete.dataset.url;

        if (!row || !url){
            console.error("Missing row or url");
            return;
        }

        openDeleteModal([row], [url]);
        return;
    }


    // ===================
    // 🔥 BULK DELETE
    // ===================
    const bulkDelete = e.target.closest("#deleteSelected");

    if (bulkDelete){

        const checked = document.querySelectorAll(".rowCheck:checked");

        if (checked.length === 0){
            alert("Select at least one shipment");
            return;
        }

        let rows = [];
        let urls = [];

        checked.forEach(cb => {

            const row = cb.closest("tr");

            if (!row) return;

            const deleteBtn = row.querySelector('[data-action="delete"]');

            if (!deleteBtn) return;

            rows.push(row);
            urls.push(deleteBtn.dataset.url);

        });

        console.log("🔥 BULK URLS:", urls);

        openDeleteModal(rows, urls);

        return;
    }


    // ===================
    // ❌ CANCEL
    // ===================
    if (e.target.id === "cancelDelete"){
        closeDeleteModal();
    }


    // ===================
    // ❌ CLICK OUTSIDE
    // ===================
    if (e.target.id === "deleteModal"){
        closeDeleteModal();
    }

});


// =======================
// ❌ CONFIRM DELETE
// =======================
function initDeleteShipment(){

    const btn = document.getElementById("confirmDelete");

    if (!btn) return;

    btn.onclick = async function(){

        if (deleteUrls.length === 0){
            console.warn("❌ nothing to delete");
            return;
        }

        try{

            // 🔥 delete one by one
            for (const url of deleteUrls){

                console.log("🚀 deleting:", url);

                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "X-CSRFToken": getCookie("csrftoken"),
                    }
                });

                const data = await res.json();

                console.log("SERVER:", data);
            }

            // 🔥 remove rows from UI
            deleteTargetRows.forEach(row => {

                row.style.opacity = "0";

                setTimeout(() => {
                    row.remove();
                }, 300);

            });

        }
        catch(err){

            console.error(err);

        }
        finally{

            closeDeleteModal();

        }

    };

}



// =========================
// LANGUAGE DROPDOWN
// =========================

const langToggle =
document.querySelector(
    ".lang_toggle"
);

const langDropdown =
document.querySelector(
    ".lang_dropdown"
);

const languages =
document.querySelector(
    ".languages"
);



// open / close
if(langToggle){

    langToggle.addEventListener(
        "click",
        (e) => {

        e.stopPropagation();

        langDropdown.classList.toggle(
            "show_lang"
        );

    });

}



// close outside
document.addEventListener(
    "click",
    (e) => {

    if(
        languages &&
        !languages.contains(e.target)
    ){

        langDropdown.classList.remove(
            "show_lang"
        );

    }

});




// =====================================
// SAVE SETTINGS
// =====================================

document.addEventListener(
    "submit",
    async function(e){

    // SETTINGS FORM
    if(

        e.target

        &&

        e.target.id ===
        "settingsForm"

    ){

        e.preventDefault();




        const form =
        e.target;




        const formData =
        new FormData(
            form
        );




        try{

            const response =
            await fetch(

                "/api/save-settings/",

                {

                    method:"POST",

                    headers:{

                        "X-CSRFToken":
                        getCookie(
                            "csrftoken"
                        ),

                        "X-Requested-With":
                        "XMLHttpRequest"

                    },

                    body:formData

                }

            );




            const data =
            await response.json();




            // ERROR
            if(!data.success){

                showAlert(

                    data.message ||

                    "Something went wrong",

                    "error"

                );

                return;

            }




            // SUCCESS
            showAlert(

                data.message,

                "success"

            );




            // OPTIONAL RELOAD
            setTimeout(() => {

                loadPage(
                    "/panel/settings/"
                );

            }, 1000);

        }

        catch(error){

            console.log(
                "settings error:",
                error
            );




            showAlert(

                "Something went wrong",

                "error"

            );

        }

    }

});



// fix reload


// =====================
// 🔥 AUTO RESTORE SPA
// =====================

document.addEventListener("visibilitychange", () => {

    if (!document.hidden) {

        console.log("TAB ACTIVE AGAIN");

        const path = window.location.pathname;

        if (path.startsWith("/panel/")) {

            loadPage(path);

        }

    }

});