// =====================
// 🔥 LOAD PAGE (CORE)
// =====================
function loadPage(url) {

    const fullUrl = new URL(url, window.location.origin);
    url = fullUrl.pathname + fullUrl.search;

    console.log("LOADING:", url);

    fetch(url, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.text())
    .then(html => {

        document.getElementById("main-content").innerHTML = html;

        // 🔥 INIT PAGE
        initPage(url);

        history.pushState(null, '', url);
    });
}


// =====================
// 🔥 GLOBAL CLICK (YON SEL)
// =====================
document.addEventListener("click", function(e) {

    const el = e.target.closest("[data-url]");
    if (!el) return;

    e.preventDefault();

    loadPage(el.dataset.url);
});



function initPage(url) {

    console.log("INIT PAGE:", url);

    if (url.includes("users")) {
        initUsersPage();
    }

    if (url.includes("shipments")) {
        initShipmentsPage();
    }

    if (url.includes("dashboard")) {
        initDashboardPage();
    }
}







