



let revenueChartInstance = null;
let profitChartInstance = null;

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

function loadPage(url) {

    fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.text())
    .then(data => {

        const parser = new DOMParser();
        const doc = parser.parseFromString(data, 'text/html');

        // 🔥 mete HTML
        document.getElementById('main-content').innerHTML = doc.body.innerHTML;

        // 🔥 pran script data yo
        const labelsScript = doc.getElementById('labels-data');
        const revenueScript = doc.getElementById('revenue-data');
        const shipmentsScript = doc.getElementById('shipments-data');

        if (labelsScript) {
            window.chartLabels = JSON.parse(labelsScript.textContent);
            window.chartRevenue = JSON.parse(revenueScript.textContent);
            window.chartShipments = JSON.parse(shipmentsScript.textContent);
        }

        history.pushState(null, '', url);
        setActive(url);

        // 🔥 relanse charts
        setTimeout(() => {
            initCharts();
        }, 100);

    });
}

// ================== CLICK EVENTS ==================
document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('[data-url]').forEach(item => {
        item.addEventListener('click', function () {
            loadPage(this.getAttribute('data-url'));
        });
    });

});


// ================== ACTIVE MENU ==================
function setActive(url) {
    document.querySelectorAll('[data-url]').forEach(item => {
        item.classList.remove('active');

        if (item.getAttribute('data-url') === url) {
            item.classList.add('active');
        }
    });
}


// ================== HANDLE REFRESH ==================
window.addEventListener('load', () => {

    let path = window.location.pathname;

    // 🔥 SI SE ROOT → ALE DASHBOARD
    if (path === "/panel/" || path === "/panel") {
        path = "/panel/dashboard/";
    }

    // 🔥 LOAD CONTENT TOUJOU
    fetch(path, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.text())
    .then(data => {

        document.getElementById('main-content').innerHTML = data;

        setActive(path);

        // 🔥 INIT CHART APRÈ CONTENT ANTRE
        setTimeout(() => {
            initCharts();
        }, 100);
    });

});

// ================== BACK BUTTON ==================
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
    initDropdowns(); // 🔥 AJOUTE SA
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



document.addEventListener('click', function (e) {

    const btn = e.target.closest('[data-url]');

    if (btn) {
        e.preventDefault();

        const url = btn.getAttribute('data-url');

        // 🔥 kenbe URL base + page
        loadPage('/panel/users/' + url);
    }

});


// search for users


let searchTimeout;

document.addEventListener('input', function (e) {

    if (e.target.id === 'searchInput') {

        const query = e.target.value.trim();

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {

            // 🔥 si vid → retounen tout users
            if (query === "") {
                loadPage('/panel/users/');
                return;
            }

            // 🔥 live search pandan wap ekri
            loadPage(`/panel/users/?q=${query}`);

        }, 300); // 🔥 ti delay pou li pa twò rapid
    }

});







