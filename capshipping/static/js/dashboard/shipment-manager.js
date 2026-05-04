
window.initUserModule = initUserModule;
window.initSenderReceiver = initSenderReceiver;



// ---------- ADD CONTACT POPUP ----------
document.addEventListener("click", function(e){

    const form = document.querySelector(".add_contact");
    const overlay = document.querySelector(".contact_overlay");

    // OPEN
    if (e.target.closest(".btn_sender") || e.target.closest(".btn_receiver")){
        form?.classList.add("active");
        overlay?.classList.add("active");
    }

    // CLOSE
    if (e.target.id === "cancelContact"){
        form?.classList.remove("active");
        overlay?.classList.remove("active");
    }

    // CLICK OUTSIDE
    if (form.classList.contains("active") && !form.contains(e.target)){
        if (!e.target.closest(".btn_sender") && !e.target.closest(".btn_receiver")){
            form.classList.remove("active");
            overlay?.classList.remove("active");
        }
    }

});


// ================== CONTACT USER SELECT (FIXED + SAFE) ==================

function initContactSelect(){

    const selectBox = document.querySelector(".custom_user_select");
    if (!selectBox) return;

    // 🔥 evite double init
    if (selectBox.dataset.init) return;
    selectBox.dataset.init = "true";

    console.log("🔥 INIT CONTACT SELECT");

    const selectedText = document.getElementById("selectedUserText2");
    const searchInput = document.querySelector(".searchUserInput2");
    const hiddenInput = document.getElementById("userHiddenInput2");
    const optionsBox = document.querySelector(".user_options");
    const dropdown = document.querySelector(".dropdown_user");
    const selectedUser = selectBox.querySelector(".selected_user");

    let debounce;

    // 🔥 OPEN
    selectedUser?.addEventListener("click", function(e){
        e.stopPropagation();
        selectBox.classList.toggle("active");
        searchInput?.focus();
    });

    // 🔥 STOP CLICK INSIDE
    dropdown?.addEventListener("click", function(e){
        e.stopPropagation();
    });

    // 🔥 CLOSE OUTSIDE (SAFE)
    if (!document.body.dataset.contactOutsideClick){
        document.body.dataset.contactOutsideClick = "true";

        document.addEventListener("click", function(e){
            if (!e.target.closest(".custom_user_select")){
                document.querySelectorAll(".custom_user_select")
                    .forEach(el => el.classList.remove("active"));
            }
        });
    }

    // 🔥 SEARCH USERS
    searchInput?.addEventListener("keyup", function(){

        const q = this.value.trim();
        clearTimeout(debounce);

        debounce = setTimeout(async () => {

            if (!q){
                optionsBox.innerHTML = "";
                return;
            }

            try{
                const res = await fetch(`/api/search-users/?q=${q}`);
                if (!res.ok) return;

                const users = await res.json();

                optionsBox.innerHTML = "";

                users.forEach(user => {

                    const div = document.createElement("div");
                    div.className = "user_option";

                    div.innerHTML = `
                        <strong>${user.name}</strong><br>
                        <small>${user.email}</small>
                    `;

                    div.addEventListener("click", () => {
                        selectedText.innerText = user.name;
                        hiddenInput.value = user.id;

                        selectBox.classList.remove("active");
                    });

                    optionsBox.appendChild(div);
                });

            }catch(err){
                console.error("Search error:", err);
            }

        }, 300);
    });
}



// ================== CONTACT SUBMIT ==================

function initContactSubmit(container){

    const form = document.getElementById("contactForm");
    if (!form) return;

    if (form.dataset.bound) return;
    form.dataset.bound = "true";

    form.addEventListener("submit", function(e){

        e.preventDefault();

        const formData = new FormData(form);

        console.log("FORM DATA:", Object.fromEntries(formData));

        if (!formData.get("name") || !formData.get("phone")){
            alert("Name and phone required");
            return;
        }

        fetch("/api/create-contact/", {
            method: "POST",
            headers: {
                "X-CSRFToken": getCookie("csrftoken"),
            },
            body: formData
        })
        .then(res => res.json())
        .then(data => {

            console.log("RESPONSE:", data);

            const alertBox = document.getElementById("alertBox");
            const alertMessage = document.getElementById("alertMessage");
            const alertIcon = document.getElementById("alertIcon");

            if (alertBox){

                alertBox.classList.remove("hidden", "success", "error");

                if (data.success){

                    alertBox.classList.add("success", "show");
                    alertMessage.textContent = "Contact created successfully";
                    alertIcon.className = "bx bx-check-circle";

                    form.reset();

                    const selectedText = container.querySelector("#selectedUserText2");
                    const hiddenInput = container.querySelector("#userHiddenInput2");

                    if (selectedText) selectedText.innerText = "select user (optional)";
                    if (hiddenInput) hiddenInput.value = "";

                    container.classList.remove("active");

                } else {

                    alertBox.classList.add("error", "show");
                    alertMessage.textContent = "Error creating contact";
                    alertIcon.className = "bx bx-error-circle";
                }

                setTimeout(() => {
                    alertBox.classList.remove("show");
                }, 3000);
            }

        })
        .catch(err => console.error(err));

    });
}



// ================== CONTACT MODULE (IMPORTANT 🔥)

function initContactModule(){

    const container = document.querySelector(".add_contact");
    if (!container) return;

    initContactSelect();
    initContactSubmit(container);
    initContactCancel(container);
}



// ================== CANCEL ==================

function initContactCancel(container){

    const cancelBtn = container.querySelector("#cancelContact");
    if (!cancelBtn) return;

    if (cancelBtn.dataset.bound) return;
    cancelBtn.dataset.bound = "true";

    cancelBtn.addEventListener("click", function(){
        container.classList.remove("active");
    });
}


document.addEventListener("click", function(e){

    const popup = document.querySelector(".add_contact");
    if (!popup) return;

    // si popup pa ouvè → pa fè anyen
    if (!popup.classList.contains("active")) return;

    // si klik anndan popup → pa fèmen
    if (e.target.closest(".add_contact")) return;

    // si klik sou bouton ki ouvè popup → pa fèmen
    if (e.target.closest(".btn_sender") || e.target.closest(".btn_receiver")) return;

    // 🔥 sinon → fèmen
    popup.classList.remove("active");

});




//======add user =========



function initSenderReceiver(){

    console.log("🔥 INIT SENDER/RECEIVER");

    document.querySelectorAll(".custom_select_box").forEach(box => {

        // 🔥 SPA FIX (evite double init)
        if (box.dataset.init) return;
        box.dataset.init = "true";

        const selected = box.querySelector(".selected_sender");
        const dropdown = box.querySelector(".dropdown_sender");
        const input = box.querySelector(".search_sender_input");
        const optionsBox = box.querySelector(".sender_options");

        if (!selected || !dropdown || !input || !optionsBox){
            console.log("❌ elements missing in sender/receiver");
            return;
        }

        let debounce;

        // =====================
        // 🔥 LOAD CONTACTS (NO USER DEPENDENCY)
        // =====================
        async function loadContacts(q = ""){

            console.log("📡 loading contacts:", q);

            try{

                const res = await fetch(`/api/user-contacts/?q=${encodeURIComponent(q)}`);
                const contacts = await res.json();

                console.log("👥 contacts:", contacts);

                optionsBox.innerHTML = "";

                if (!contacts.length){
                    optionsBox.innerHTML = "<p style='padding:10px;'>No contacts found</p>";
                    return;
                }

                contacts.forEach(c => {

                    const div = document.createElement("div");
                    div.className = "sender_option";

                    div.innerHTML = `<p>${c.name} (${c.phone})</p>`;

                    div.addEventListener("click", () => {

                        // 🔥 SET TEXT
                        selected.querySelector("p").innerText = `${c.name} (${c.phone})`;

                        // 🔥 DETECT sender / receiver
                        const label = box.closest(".sender_from")?.querySelector("label")?.innerText;

                        if (label && label.includes("Sender")){
                            document.getElementById("senderIdInput").value = c.id;
                            console.log("📦 sender selected:", c.id);
                        } else {
                            document.getElementById("receiverIdInput").value = c.id;
                            console.log("📦 receiver selected:", c.id);
                        }

                        dropdown.classList.remove("active");
                    });

                    optionsBox.appendChild(div);
                });

            }catch(err){
                console.error("❌ loadContacts error:", err);
                optionsBox.innerHTML = "<p style='padding:10px;color:red;'>Error loading contacts</p>";
            }
        }

        // =====================
        // 🔥 OPEN DROPDOWN
        // =====================
        selected.addEventListener("click", (e) => {
            e.stopPropagation();

            // 🔥 fèmen lòt dropdown
            document.querySelectorAll(".dropdown_sender").forEach(d => {
                if (d !== dropdown) d.classList.remove("active");
            });

            dropdown.classList.toggle("active");

            // 🔥 load all contacts premye fwa
            loadContacts();

            // 🔥 focus input
            setTimeout(() => input.focus(), 100);
        });

        // =====================
        // 🔥 PREVENT CLOSE INSIDE
        // =====================
        dropdown.addEventListener("click", e => e.stopPropagation());

        // =====================
        // 🔥 CLOSE OUTSIDE
        // =====================
        document.addEventListener("click", () => {
            dropdown.classList.remove("active");
        });

        // =====================
        // 🔍 SEARCH CONTACT
        // =====================
        input.addEventListener("input", function(){

            const q = this.value.trim();
            console.log("⌨️ search:", q);

            clearTimeout(debounce);

            debounce = setTimeout(() => {
                loadContacts(q);
            }, 300);

        });

    });

    console.log("🚀 SENDER/RECEIVER READY");






    // ---------- CLICK OUTSIDE ----------
    document.addEventListener("click", function(e){
        if (!e.target.closest(".custom_select_box")){
            document.querySelectorAll(".dropdown_sender")
                .forEach(d => d.classList.remove("active"));
        }
    });

}


function initUserModule(){

    console.log("🔥 USER MODULE START");

    const userType = document.getElementById("userType");
    const box = document.getElementById("userSearchBox");

    if (!box){
        console.log("❌ box not found");
        return;
    }

    // 🔥 evite double init (SPA)
    if (box.dataset.init) return;
    box.dataset.init = "true";

    const selected = box.querySelector(".selected_user_box");
    const input = box.querySelector(".searchInputUser");
    const results = box.querySelector(".user_results");
    const dropdown = box.querySelector(".grid_user_search");

    if (!selected || !input || !results || !dropdown){
        console.log("❌ elements missing", {selected, input, results, dropdown});
        return;
    }

    let debounce;

    // =====================
    // 🔥 USER / GUEST TOGGLE
    // =====================
    if (userType){
        box.style.display = "none"; // default

        userType.addEventListener("change", function(){

            console.log("👤 userType:", this.value);

            if (this.value === "user"){
                box.style.display = "block";
            } else {
                box.style.display = "none";

                // reset
                document.getElementById("selectedUserText").innerText = "Select user";
                document.getElementById("userIdInput").value = "";
                input.value = "";
                results.innerHTML = "";
                dropdown.style.display = "none";
            }

        });
    }

    // =====================
    // 🔥 INIT STATE
    // =====================
    dropdown.style.display = "none";

    // =====================
    // 🔥 OPEN DROPDOWN
    // =====================
    selected.addEventListener("click", (e) => {
        e.stopPropagation();

        dropdown.style.display = "block";
        input.focus();

        console.log("📂 dropdown opened");
    });

    // =====================
    // 🔥 PA FÈMEN LÈ CLICK ANNDAN
    // =====================
    dropdown.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // =====================
    // 🔥 CLOSE OUTSIDE
    // =====================
    document.addEventListener("click", (e) => {
        if (!box.contains(e.target)){
            dropdown.style.display = "none";
        }
    });

    // =====================
    // 🔥 SEARCH USER
    // =====================
    input.addEventListener("input", function(){

        const q = this.value.trim();
        console.log("⌨️ typing:", q);

        clearTimeout(debounce);

        debounce = setTimeout(async () => {

            if (!q){
                results.innerHTML = "";
                return;
            }

            try{

                const res = await fetch(`/api/search-users/?q=${encodeURIComponent(q)}`);
                console.log("📡 status:", res.status);

                if (!res.ok){
                    throw new Error("API ERROR");
                }

                const users = await res.json();
                console.log("👥 users:", users);

                results.innerHTML = "";

                if (!users.length){
                    results.innerHTML = `<p style="padding:10px;">No user found</p>`;
                    return;
                }

                users.forEach(u => {

                    const div = document.createElement("div");
                    div.className = "initial";

                    div.innerHTML = `
                        <span class="INT-search">${u.name ? u.name.charAt(0) : "U"}</span>
                        <div class="name_email">
                            <p>${u.name}</p>
                            <p>${u.email}</p>
                        </div>
                    `;

                    div.addEventListener("click", (e) => {
                        e.stopPropagation();

                        document.getElementById("selectedUserText").innerText = u.name;
                        document.getElementById("userIdInput").value = u.id;

                        dropdown.style.display = "none";
                        input.value = "";
                        results.innerHTML = "";

                        console.log("✅ user selected:", u);
                    });

                    results.appendChild(div);
                });

            }catch(err){
                console.error("❌ fetch error:", err);
                results.innerHTML = `<p style="padding:10px;color:red;">Error loading users</p>`;
            }

        }, 300);

    });

    console.log("🚀 USER MODULE READY");

    // =====================
    // 🔥 CLICK OUTSIDE → CLOSE
    // =====================
    document.addEventListener("click", (e) => {
        if (!box.contains(e.target)){
            list.style.display = "none";
            isOpen = false;
        }
    });

}







function initShipmentSubmit(){

    console.log("🔥 INIT SHIPMENT SUBMIT");

    const form = document.getElementById("shipmentForm");
    const btn = document.getElementById("saveShipment");

    if (!form || !btn){
        console.log("❌ form or button not found");
        return;
    }

    if (form.dataset.bound) return;
    form.dataset.bound = "true";

    function getCSRFToken(){
        return document.cookie
            .split("; ")
            .find(row => row.startsWith("csrftoken"))
            ?.split("=")[1];
    }

    btn.addEventListener("click", function(e){

        e.preventDefault();

        console.log("📦 submitting shipment...");

        const data = {
            user: document.getElementById("userIdInput")?.value || null,
            sender: document.getElementById("senderIdInput")?.value || null,
            receiver: document.getElementById("receiverIdInput")?.value || null,

            origin_warehouse: form.querySelector("[name='origin_warehouse']")?.value,
            destination_warehouse: form.querySelector("[name='destination_warehouse']")?.value,
            category: form.querySelector("[name='category']")?.value,
            shipping_type: form.querySelector("[name='shipping_type']")?.value,

            weight: Number(form.querySelector("[name='weight']")?.value || 0),
            length: Number(form.querySelector("[name='length']")?.value || 0),
            width: Number(form.querySelector("[name='width']")?.value || 0),
            height: Number(form.querySelector("[name='height']")?.value || 0),
            quantity: Number(form.querySelector("[name='quantity']")?.value || 1),
            extra_fee: Number(form.querySelector("[name='extra_fee']")?.value || 0),
            description: form.querySelector("[name='description']")?.value || ""
        };

        console.log("📤 DATA:", data);

        // =====================
        // VALIDATION
        // =====================
        if (!data.sender || !data.receiver){
            showAlert("Select sender and receiver", "error");
            return;
        }

        btn.disabled = true;
        btn.innerText = "Saving...";

        fetch("/api/shipments/create/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCSRFToken()
            },
            body: JSON.stringify(data)
        })
        .then(res => res.json())
        .then(result => {

            console.log("✅ RESPONSE:", result);

            // =====================
// 🔥 SET PRINT LABEL URL
// =====================
const printBtn = document.getElementById("printLabelBtn");

if (printBtn && result.id){
    printBtn.dataset.printUrl = `/package/${result.id}/label/`;
    console.log("🖨️ print url set:", printBtn.dataset.printUrl);
}

            if (!result.tracking){
                showAlert("Error creating shipment", "error");
                btn.disabled = false;
                btn.innerText = "Save Shipment";
                return;
            }

            // =====================
            // SUMMARY UI
            // =====================
            document.getElementById("sum_tracking").innerText = result.tracking;
            document.getElementById("sum_pkg").innerText = result.pkg;
            document.getElementById("sum_price").innerText = "$" + result.price;

            document.getElementById("sum_type").innerText =
                data.shipping_type || "-";

            const senderText = document.querySelectorAll(".sender_from")[0]
                ?.querySelector(".selected_sender p")?.innerText;

            const receiverText = document.querySelectorAll(".sender_from")[1]
                ?.querySelector(".selected_sender p")?.innerText;

            document.getElementById("sum_sender").innerText = senderText || "-";
            document.getElementById("sum_receiver").innerText = receiverText || "-";

            // =====================
            // SHOW SUMMARY
            // =====================
            const summary = document.querySelector(".shipment_summary");

            if (summary){
                summary.style.display = "block";
                summary.classList.add("active"); // 🔥 sa enpòtan
                summary.scrollIntoView({behavior: "smooth"});
            }

            // egzanp apre fetch / AJAX save

            // =====================
            // SUCCESS MESSAGE (MENM STYLE)
            // =====================
            showAlert("Shipment created successfully", "success");

            // =====================
            // RESET
            // =====================
            form.reset();

            document.getElementById("selectedUserText").innerText = "Select user";

            document.querySelectorAll(".selected_sender p").forEach((el, i) => {
                el.innerText = i === 0 ? "Search sender" : "Search receiver";
            });

            document.getElementById("senderIdInput").value = "";
            document.getElementById("receiverIdInput").value = "";

            btn.disabled = false;
            btn.innerText = "Save Shipment";

        })


        .catch(err => {
            console.error("❌ ERROR:", err);
            showAlert("Something went wrong", "error");

            btn.disabled = false;
            btn.innerText = "Save Shipment";
        });

    });

    console.log("🚀 SUBMIT READY");
}




function showAlert(message, type){

    const alertBox = document.getElementById("alertBox");
    const alertMessage = document.getElementById("alertMessage");
    const alertIcon = document.getElementById("alertIcon");

    if (!alertBox) return;

    alertBox.classList.remove("hidden", "success", "error");

    if (type === "success"){
        alertBox.classList.add("success", "show");
        alertMessage.textContent = message;
        alertIcon.className = "bx bx-check-circle";
    } else {
        alertBox.classList.add("error", "show");
        alertMessage.textContent = message;
        alertIcon.className = "bx bx-error-circle";
    }

    setTimeout(() => {
        alertBox.classList.remove("show");
    }, 3000);
}