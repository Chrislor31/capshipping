
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

    const form =
    document.getElementById(
        "contactForm"
    );

    if (!form) return;

    // 🔥 SPA SAFE
    if (form.dataset.bound) return;

    form.dataset.bound = "true";




    form.addEventListener(
        "submit",
        function(e){

        e.preventDefault();




        const formData =
        new FormData(form);

        // ========================================
// 🔥 FULL PHONE
// ========================================

const contactPhoneInput =

document.querySelector(
    "#contact_phone"
);


const rawPhone =

contactPhoneInput.value
.replace(/\D/g, "");


const itiInstance =

window.intlTelInputGlobals
.getInstance(contactPhoneInput);


const fullPhone =

"+" +

itiInstance.getSelectedCountryData()
.dialCode +

rawPhone;


// 🔥 REPLACE PHONE
formData.set(
    "phone",
    fullPhone
);


console.log(
    "FULL PHONE:",
    fullPhone
);




        console.log(
            "FORM DATA:",
            Object.fromEntries(formData)
        );




        // VALIDATION
        if (

            !formData.get("name")

            ||

            !formData.get("phone")

        ){

            showAlert(

                "Name and phone required",

                "error"

            );

            return;

        }




        // ========================================
        // 🔥 CREATE OR UPDATE
        // ========================================

        const contactId =
        document.getElementById(
            "contact_id"
        ).value;




        let url =
        "/api/create-contact/";




        // UPDATE
        if(contactId){

            url =
            "/api/update-contact/";

        }




        fetch(url, {

            method: "POST",

            headers: {

                "X-CSRFToken":
                getCookie("csrftoken"),

            },

            body: formData

        })




        .then(res => res.json())




        .then(data => {

            console.log(
                "RESPONSE:",
                data
            );




            const alertBox =
            document.getElementById(
                "alertBox"
            );



            const alertMessage =
            document.getElementById(
                "alertMessage"
            );



            const alertIcon =
            document.getElementById(
                "alertIcon"
            );




            if (alertBox){

                alertBox.classList.remove(

                    "hidden",

                    "success",

                    "error"

                );




                // ========================================
                // SUCCESS
                // ========================================

                if (data.success){

                    alertBox.classList.add(

                        "success",

                        "show"

                    );




                    alertMessage.textContent =
                    data.message;




                    alertIcon.className =
                    "bx bx-check-circle";




                    // RESET FORM
                    form.reset();




                    // RESET USER
                    const selectedText =
                    container.querySelector(
                        "#selectedUserText2"
                    );



                    const hiddenInput =
                    container.querySelector(
                        "#userHiddenInput2"
                    );



                    if (selectedText){

                        selectedText.innerText =
                        "select user (optional)";

                    }



                    if (hiddenInput){

                        hiddenInput.value = "";

                    }




                    // RESET CONTACT ID
                    document.getElementById(
                        "contact_id"
                    ).value = "";




                    // RESET TITLE
                    const title =
                    document.getElementById(
                        "contactModalTitle"
                    );



                    if(title){

                        title.innerText =
                        "Add Contact";

                    }




                    // RESET BUTTON
                    document.getElementById(
                        "saveContactBtn"
                    ).innerHTML = `

                        <i class='bx bx-save'></i>

                        Save Contact

                    `;




                    // CLOSE POPUP
                    container.classList.remove(
                        "active"
                    );



                    document.querySelector(
                        ".contact_overlay"
                    )?.classList.remove(
                        "active"
                    );




                    // 🔥 RELOAD CONTACT PAGE
                    loadPage(
                        "/panel/contacts/"
                    );

                }




                // ========================================
                // ERROR
                // ========================================

                else{

                    alertBox.classList.add(

                        "error",

                        "show"

                    );




                    alertMessage.textContent =
                    "Error saving contact";




                    alertIcon.className =
                    "bx bx-error-circle";

                }




                // AUTO HIDE
                setTimeout(() => {

                    alertBox.classList.remove(
                        "show"
                    );

                }, 3000);

            }

        })




        .catch(err => {

            console.error(err);

            showAlert(

                "Something went wrong",

                "error"

            );

        });

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


            // 🔥 IMPORTANT (MATCH HTML NAME)
            shipment_type: form.querySelector("[name='shipment_type']")?.value,

            payment_status: document.getElementById("paymentStatusInput")?.value,
               // 🔥 SA KI TE MANKE
            status: form.querySelector("[name='status']")?.value,

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

        // =====================
        // 🔥 MODE DETECTION
        // =====================
        const shipmentId = form.dataset.id;

        const url = shipmentId
            ? `/api/update-shipment/${shipmentId}/`
            : `/api/shipments/create/`;

        const isEdit = !!shipmentId;

        console.log("MODE:", isEdit ? "EDIT" : "CREATE");
        console.log("URL:", url);

        fetch(url, {
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
            // PRINT LABEL
            // =====================
            const printBtn = document.getElementById("printLabelBtn");
            if (printBtn && result.id){
                printBtn.dataset.printUrl = `/package/${result.id}/label/`;
            }

            // =====================
            // 🔥 FIX RESPONSE CHECK
            // =====================
            if (!result.success && !result.tracking){
                showAlert(result.error || "Something went wrong", "error");

                btn.disabled = false;
                btn.innerText = "Save Shipment";
                return;
            }

            // =====================
            // SUMMARY UI
            // =====================
            document.getElementById("sum_tracking").innerText = result.tracking || "-";
            document.getElementById("sum_pkg").innerText = result.pkg || "-";
            document.getElementById("sum_price").innerText = "$" + (result.price || 0);

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
                summary.classList.add("active");
                summary.scrollIntoView({behavior: "smooth"});
            }

            // =====================
            // 🔥 SUCCESS MESSAGE FIX
            // =====================
            showAlert(
                isEdit ? "Shipment updated successfully" : "Shipment created successfully",
                "success"
            );

            // =====================
            // RESET (ONLY ADD)
            // =====================
            if (!isEdit){
                form.reset();

                document.getElementById("selectedUserText").innerText = "Select user";

                document.querySelectorAll(".selected_sender p").forEach((el, i) => {
                    el.innerText = i === 0 ? "Search sender" : "Search receiver";
                });

                document.getElementById("senderIdInput").value = "";
                document.getElementById("receiverIdInput").value = "";
            }

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


function initPaymentToggle(){

    const switchEl = document.getElementById("paymentSwitch");
    const hidden = document.getElementById("paymentStatusInput");

    if (!switchEl || !hidden) return;

    // 🔥 sync edit mode
    hidden.value = switchEl.checked ? "paid" : "unpaid";

    switchEl.addEventListener("change", function(){
        hidden.value = this.checked ? "paid" : "unpaid";
    });
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


// pop up warehouses tableau

// ========================================
// WAREHOUSE MODAL + AJAX (SPA VERSION)
// ========================================

document.addEventListener("click", function(e){

    // =========================
    // OPEN MODAL
    // =========================
    const openBtn =
    e.target.closest("#openWarehouseModal");

    if(openBtn){

        const modal =
        document.getElementById("warehouseModal");

        if(modal){

            modal.classList.add("show");

        }

    }


    // =========================
    // CLOSE MODAL
    // =========================
    if(
        e.target.closest("#closeWarehouseModal")
        ||
        e.target.closest("#cancelWarehouse")
    ){

        const modal =
        document.getElementById("warehouseModal");

        if(modal){

            modal.classList.remove("show");

        }

    }


    // =========================
    // CLOSE OUTSIDE
    // =========================
    const modal =
    document.getElementById("warehouseModal");

    if(
        modal &&
        e.target.id === "warehouseModal"
    ){

        modal.classList.remove("show");

    }

});
// ========================================
// AJAX SUBMIT (SPA SAFE)
// ========================================

document.addEventListener("submit", async function(e){

    // TARGET FORM
    if(
        e.target &&
        e.target.id === "warehouseForm"
    ){

        e.preventDefault();

        console.log(
            "warehouse submit running"
        );

        const form =
        e.target;

        const formData =
        new FormData(form);

        // =========================
        // REMOVE OLD ERRORS
        // =========================
        form
        .querySelectorAll(
            ".input_error"
        )
        .forEach(input => {

            input.classList.remove(
                "input_error"
            );

        });


        try{

            const response =
            await fetch(
                "/api/add-warehouse/",
                {
                    method:"POST",

                    body:formData,

                    headers:{
                        "X-Requested-With":
                        "XMLHttpRequest"
                    }
                }
            );

            const data =
            await response.json();

            console.log(data);

            // =========================
            // VALIDATION ERRORS
            // =========================
            if(!data.success){

                for(
                    const field
                    in data.errors
                ){

                    const input =
                    form.querySelector(
                        `[name="${field}"]`
                    );

                    if(input){

                        input.classList.add(
                            "input_error"
                        );

                    }

                }

                // ALERT ERROR
                showAlert(
                    "Please fill all required fields",
                    "error"
                );

                return;

            }

            // =========================
            // SUCCESS
            // =========================
            const modal =
            document.getElementById(
                "warehouseModal"
            );

            if(modal){

                modal.classList.remove(
                    "show"
                );

            }

            // RESET FORM
            form.reset();

            // RESET UPDATE MODE
            document.getElementById(
                "warehouse_id"
            ).value = "";

            document.getElementById(
                "save_warehouse"
            ).innerHTML = `
                <i class='bx bx-save'></i>
                Save warehouse
            `;

            // SUCCESS ALERT
            showAlert(
                data.message,
                "success"
            );

        }

        catch(error){

            console.log(
                "warehouse error:",
                error
            );

            showAlert(
                "Something went wrong",
                "error"
            );

        }

    }

});



// ========================================
// EDIT WAREHOUSE
// ========================================


document.addEventListener("click", async function(e){

    const editBtn =
    e.target.closest(".edit_warehouse_btn");

    if(!editBtn) return;

    e.preventDefault();

    const warehouseId =
    editBtn.dataset.id;

    console.log(
        "editing warehouse:",
        warehouseId
    );

    try{

        const response =
        await fetch(
            `/api/edit-warehouse/${warehouseId}/`
        );

        const data =
        await response.json();

        console.log(data);

        // OPEN MODAL
        const modal =
        document.getElementById(
            "warehouseModal"
        );

        modal.classList.add("show");

        // SET VALUES
        document.querySelector(
            "#warehouse_id"
        ).value = data.id;

        document.querySelector(
            '[name="name"]'
        ).value = data.name;

        document.querySelector(
            '[name="type"]'
        ).value = data.type;

        document.querySelector(
            '[name="city"]'
        ).value = data.city;

        document.querySelector(
            '[name="state"]'
        ).value = data.state;

        document.querySelector(
            '[name="area"]'
        ).value = data.area;

        document.querySelector(
            '[name="zip_code"]'
        ).value = data.zip_code;

        document.querySelector(
            '[name="label_code"]'
        ).value = data.label_code;

        document.querySelector(
            '[name="address"]'
        ).value = data.address;

        // CHANGE BUTTON
        document.getElementById(
            "save_warehouse"
        ).innerHTML = `
            <i class='bx bx-save'></i>
            Update warehouse
        `;

    }

    catch(error){

        console.log(
            "edit warehouse error:",
            error
        );

    }

});




// =======================
// 🔥 WAREHOUSE DELETE STATE
// =======================

let warehouseDeleteRows = [];
let warehouseDeleteUrls = [];


// =======================
// 🔓 OPEN DELETE MODAL
// =======================

function openWarehouseDeleteModal(rows, urls){

    warehouseDeleteRows = rows;
    warehouseDeleteUrls = urls;

    const modal =
    document.getElementById(
        "deleteModal"
    );

    const msg =
    document.getElementById(
        "deleteMessage"
    );

    if (!modal) return;

    if (urls.length === 1){

        msg.innerText =
        "Are you sure you want to delete this warehouse?";

    }

    else{

        msg.innerText =
        `Are you sure you want to delete ${urls.length} warehouses?`;

    }

    modal.classList.remove(
        "hidden"
    );

}



// =======================
// 🔒 CLOSE DELETE MODAL
// =======================

function closeWarehouseDeleteModal(){

    const modal =
    document.getElementById(
        "deleteModal"
    );

    if (modal){

        modal.classList.add(
            "hidden"
        );

    }

    warehouseDeleteRows = [];
    warehouseDeleteUrls = [];

}



// =======================
// 🎯 CLICK HANDLER
// =======================

document.addEventListener("click", function(e){

    // ===================
    // SINGLE DELETE
    // ===================
    const singleDelete =
    e.target.closest(
        '[data-action="delete"]'
    );

    if (singleDelete){

        const row =
        singleDelete.closest("tr");

        const url =
        singleDelete.dataset.url;

        if (!row || !url){

            console.error(
                "Missing row or url"
            );

            return;

        }

        openWarehouseDeleteModal(
            [row],
            [url]
        );

        return;

    }


    // ===================
    // BULK DELETE
    // ===================
    const bulkDelete =
    e.target.closest(
        "#deleteSelected"
    );

    if (bulkDelete){

        const checked =
        document.querySelectorAll(
            ".rowCheck:checked"
        );

        if (checked.length === 0){

            showAlert(
                "Select at least one warehouse",
                "error"
            );

            return;

        }

        let rows = [];
        let urls = [];

        checked.forEach(cb => {

            const row =
            cb.closest("tr");

            if (!row) return;

            const deleteBtn =
            row.querySelector(
                '[data-action="delete"]'
            );

            if (!deleteBtn) return;

            rows.push(row);

            urls.push(
                deleteBtn.dataset.url
            );

        });

        openWarehouseDeleteModal(
            rows,
            urls
        );

        return;

    }


    // ===================
    // CANCEL
    // ===================
    if (
        e.target.id ===
        "cancelDelete"
    ){

        closeWarehouseDeleteModal();

    }


    // ===================
    // CLICK OUTSIDE
    // ===================
    if (
        e.target.id ===
        "deleteModal"
    ){

        closeWarehouseDeleteModal();

    }

});




// =======================
// ❌ CONFIRM DELETE
// =======================

function initDeleteWarehouse(){

    const btn =
    document.getElementById(
        "confirmDelete"
    );

    if (!btn) return;

    btn.onclick = async function(){

        if (
            warehouseDeleteUrls.length === 0
        ){

            console.warn(
                "nothing to delete"
            );

            return;

        }

        try{

            for (
                const url
                of warehouseDeleteUrls
            ){

                const res =
                await fetch(url, {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie("csrftoken"),

                    }

                });

                const data =
                await res.json();

                console.log(data);

            }

            // REMOVE ROWS
            warehouseDeleteRows
            .forEach(row => {

                row.style.opacity = "0";

                setTimeout(() => {

                    row.remove();

                }, 300);

            });

            showAlert(
                "Warehouse deleted successfully",
                "success"
            );

        }

        catch(err){

            console.error(err);

            showAlert(
                "Delete failed",
                "error"
            );

        }

        finally{

            closeWarehouseDeleteModal();

        }

    };

}


// INIT
initDeleteWarehouse();



// ========================================
// LOAD TRACKING PAGE
// ========================================

// ========================================
// LOAD TRACKING PAGE
// ========================================

let trackingRefreshTimeout;

async function loadTrackingPage(url){

    try{

        const response =
        await fetch(url, {

            headers:{
                "X-Requested-With":
                "XMLHttpRequest"
            }

        });

        const html =
        await response.text();

        const parser =
        new DOMParser();

        const doc =
        parser.parseFromString(
            html,
            "text/html"
        );

        const newContent =
        doc.querySelector(
            ".tracking_management"
        );

        const currentContent =
        document.querySelector(
            ".tracking_management"
        );

        if(
            newContent &&
            currentContent
        ){

            currentContent.innerHTML =
            newContent.innerHTML;

        }

    }

    catch(error){

        console.log(
            "tracking ajax error:",
            error
        );

    }

}




// ========================================
// SMART REFRESH
// ========================================

function scheduleTrackingRefresh(){

    // CLEAR OLD TIMER
    clearTimeout(
        trackingRefreshTimeout
    );

    // NEW TIMER
    trackingRefreshTimeout =
    setTimeout(() => {

        const trackingPage =
        document.querySelector(
            ".tracking_management"
        );

        // PAGE NOT OPEN
        if(!trackingPage) return;

        // INPUT FOCUS
        const active =
        document.activeElement;

        if(

            active &&
            (
                active.tagName === "INPUT"
                ||
                active.tagName === "TEXTAREA"
                ||
                active.tagName === "SELECT"
            )

        ){

            scheduleTrackingRefresh();

            return;

        }

        // DROPDOWN OPEN
        if(
            document.querySelector(
                ".dropdown_menu.show"
            )
        ){

            scheduleTrackingRefresh();

            return;

        }

        // CHECKBOX SELECTED
        if(
            document.querySelector(
                ".rowCheck:checked"
            )
        ){

            scheduleTrackingRefresh();

            return;

        }

        // REFRESH
        loadTrackingPage(
            "/panel/tracking-updates/"
        );

        // LOOP AGAIN
        scheduleTrackingRefresh();

    }, 11000);

}




// ========================================
// AJAX PAGINATION
// ========================================

document.addEventListener("click", function(e){

    const btn =
    e.target.closest(
        '.tracking_management .page_controls button[data-url]'
    );

    if(!btn) return;

    e.preventDefault();

    const url =
    btn.dataset.url;

    loadTrackingPage(url);

    scheduleTrackingRefresh();

});




// ========================================
// AJAX SEARCH
// ========================================

document.addEventListener("submit", function(e){

    if(
        e.target &&
        e.target.id ===
        "trackingSearchForm"
    ){

        e.preventDefault();

        const form =
        e.target;

        const query =
        form.querySelector(
            "#trackingSearchInput"
        ).value;

        loadTrackingPage(

            `/panel/tracking-updates/?q=${query}`

        );

        scheduleTrackingRefresh();

    }

});




// ========================================
// INPUT ACTIVITY
// ========================================

document.addEventListener("input", function(e){

    if(
        e.target.closest(
            ".tracking_management"
        )
    ){

        scheduleTrackingRefresh();

    }

});




// ========================================
// START SMART REFRESH
// ========================================

scheduleTrackingRefresh();



// delete tracking update

// =======================
// 🔥 TRACKING DELETE STATE
// =======================

let trackingDeleteRows = [];
let trackingDeleteUrls = [];




// =======================
// 🔓 OPEN DELETE MODAL
// =======================

function openTrackingDeleteModal(rows, urls){

    trackingDeleteRows = rows;
    trackingDeleteUrls = urls;

    const modal =
    document.getElementById(
        "deleteModal"
    );

    const msg =
    document.getElementById(
        "deleteMessage"
    );

    if (!modal) return;

    if (urls.length === 1){

        msg.innerText =
        "Are you sure you want to delete this tracking update?";

    }

    else{

        msg.innerText =
        `Are you sure you want to delete ${urls.length} tracking updates?`;

    }

    modal.classList.remove(
        "hidden"
    );

}




// =======================
// 🔒 CLOSE DELETE MODAL
// =======================

function closeTrackingDeleteModal(){

    const modal =
    document.getElementById(
        "deleteModal"
    );

    if (modal){

        modal.classList.add(
            "hidden"
        );

    }

    trackingDeleteRows = [];
    trackingDeleteUrls = [];

}




// =======================
// 🎯 CLICK HANDLER
// =======================

document.addEventListener("click", function(e){

    // ===================
    // SINGLE DELETE
    // ===================
    const singleDelete =
    e.target.closest(
        '.tracking_management [data-action="delete"]'
    );

    if (singleDelete){

        const row =
        singleDelete.closest("tr");

        const url =
        singleDelete.dataset.url;

        if (!row || !url){

            console.error(
                "Missing row or url"
            );

            return;

        }

        openTrackingDeleteModal(
            [row],
            [url]
        );

        return;

    }



    // ===================
    // BULK DELETE
    // ===================
    const bulkDelete =
    e.target.closest(
        '.tracking_management #deleteSelected'
    );

    if (bulkDelete){

        const checked =
        document.querySelectorAll(
            '.tracking_management .rowCheck:checked'
        );

        if (checked.length === 0){

            showAlert(
                "Select at least one tracking update",
                "error"
            );

            return;

        }

        let rows = [];
        let urls = [];

        checked.forEach(cb => {

            const row =
            cb.closest("tr");

            if (!row) return;

            const deleteBtn =
            row.querySelector(
                '[data-action="delete"]'
            );

            if (!deleteBtn) return;

            rows.push(row);

            urls.push(
                deleteBtn.dataset.url
            );

        });

        openTrackingDeleteModal(
            rows,
            urls
        );

        return;

    }



    // ===================
    // CANCEL
    // ===================
    if (
        e.target.id ===
        "cancelDelete"
    ){

        closeTrackingDeleteModal();

    }



    // ===================
    // CLICK OUTSIDE
    // ===================
    if (
        e.target.id ===
        "deleteModal"
    ){

        closeTrackingDeleteModal();

    }

});




// =======================
// ❌ CONFIRM DELETE
// =======================

function initDeleteTracking(){

    const btn =
    document.getElementById(
        "confirmDelete"
    );

    if (!btn) return;

    btn.onclick = async function(){

        if (
            trackingDeleteUrls.length === 0
        ){

            console.warn(
                "nothing to delete"
            );

            return;

        }

        try{

            for (
                const url
                of trackingDeleteUrls
            ){

                const res =
                await fetch(url, {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie("csrftoken"),

                    }

                });

                const data =
                await res.json();

                console.log(data);

            }



            // REMOVE ROWS
            trackingDeleteRows
            .forEach(row => {

                row.style.opacity = "0";

                setTimeout(() => {

                    row.remove();

                }, 300);

            });



            showAlert(
                "Tracking update deleted successfully",
                "success"
            );

        }

        catch(err){

            console.error(err);

            showAlert(
                "Delete failed",
                "error"
            );

        }

        finally{

            closeTrackingDeleteModal();

        }

    };

}




// =======================
// INIT
// =======================

initDeleteTracking();





// ========================================
// CATEGORY MODAL
// ========================================

document.addEventListener(
    "click",
    function(e){

    // OPEN
    if(
        e.target.closest(
            "#openCategoryModal"
        )
    ){

        const modal =
        document.getElementById(
            "categoryModal"
        );

        if(modal){

            modal.classList.add(
                "show"
            );

        }

    }



    // CLOSE
    if(

        e.target.closest(
            "#closeCategoryModal"
        )

        ||

        e.target.closest(
            "#cancelCategory"
        )

    ){

        const modal =
        document.getElementById(
            "categoryModal"
        );

        if(modal){

            modal.classList.remove(
                "show"
            );

        }

    }



    // OUTSIDE CLICK
    const modal =
    document.getElementById(
        "categoryModal"
    );

    if(
        e.target === modal
    ){

        modal.classList.remove(
            "show"
        );

    }

});



// ========================================
// CATEGORY AJAX SUBMIT
// ========================================

document.addEventListener(
    "submit",
    async function(e){

    // TARGET FORM
    if(

        e.target &&

        e.target.id ===
        "categoryForm"

    ){

        e.preventDefault();

        console.log(
            "category submit running"
        );



        const form =
        e.target;

        const formData =
        new FormData(form);



        // REMOVE OLD ERRORS
        form
        .querySelectorAll(
            ".input_error"
        )
        .forEach(input => {

            input.classList.remove(
                "input_error"
            );

        });




        // UPDATE OR ADD
        let url =
        "/api/add-category/";

        if(

            document.getElementById(
                "category_id"
            ).value

        ){

            url =
            "/api/update-category/";

        }




        try{

            const response =
            await fetch(url, {

                method:"POST",

                body:formData,

                headers:{
                    "X-Requested-With":
                    "XMLHttpRequest"
                }

            });




            const data =
            await response.json();

            console.log(data);




            // VALIDATION ERRORS
            if(!data.success){

                for(

                    const field
                    in data.errors

                ){

                    const input =
                    form.querySelector(

                        `[name="${field}"]`

                    );

                    if(input){

                        input.classList.add(
                            "input_error"
                        );

                    }

                }



                showAlert(

                    "Please fill all required fields",

                    "error"

                );

                return;

            }




            // SUCCESS
            showAlert(

                data.message,

                "success"

            );



            // CLOSE MODAL
            document
            .getElementById(
                "categoryModal"
            )
            .classList.remove(
                "show"
            );



            // RESET FORM
            form.reset();



            // RESET ID
            document
            .getElementById(
                "category_id"
            ).value = "";



            // RESET BUTTON
            document
            .getElementById(
                "save_category"
            ).innerHTML = `

                <i class='bx bx-save'></i>

                Save category

            `;



            // RELOAD TABLE
            loadPage(
                "/panel/categories/"
            );

        }

        catch(error){

            console.log(
                "category error:",
                error
            );



            showAlert(

                "Something went wrong",

                "error"

            );

        }

    }

});




// ========================================
// CATEGORY MODAL
// ========================================

document.addEventListener(
    "click",
    function(e){

    // OPEN
    if(
        e.target.closest(
            "#openCategoryModal"
        )
    ){

        // RESET FORM
        document
        .getElementById(
            "categoryForm"
        )
        .reset();

        // RESET ID
        document
        .getElementById(
            "category_id"
        ).value = "";

        // RESET BUTTON
        document
        .getElementById(
            "save_category"
        ).innerHTML = `

            <i class='bx bx-save'></i>

            Save category

        `;

        // OPEN MODAL
        const modal =
        document.getElementById(
            "categoryModal"
        );

        if(modal){

            modal.classList.add(
                "show"
            );

        }

    }



    // CLOSE
    if(

        e.target.closest(
            "#closeCategoryModal"
        )

        ||

        e.target.closest(
            "#cancelCategory"
        )

    ){

        const modal =
        document.getElementById(
            "categoryModal"
        );

        if(modal){

            modal.classList.remove(
                "show"
            );

        }

    }



    // OUTSIDE CLICK
    const modal =
    document.getElementById(
        "categoryModal"
    );

    if(
        e.target === modal
    ){

        modal.classList.remove(
            "show"
        );

    }

});




// ========================================
// EDIT CATEGORY
// ========================================

document.addEventListener(
    "click",
    async function(e){

    const editBtn =
    e.target.closest(
        ".edit_category_btn"
    );

    if(!editBtn) return;

    e.preventDefault();




    const categoryId =
    editBtn.dataset.id;

    console.log(
        "editing category:",
        categoryId
    );




    try{

        const response =
        await fetch(

            `/api/edit-category/${categoryId}/`

        );



        const data =
        await response.json();

        console.log(data);




        // OPEN MODAL
        const modal =
        document.getElementById(
            "categoryModal"
        );

        modal.classList.add(
            "show"
        );




        // SET VALUES
        document.getElementById(
            "category_id"
        ).value = data.id;



        document.querySelector(
            '[name="name"]'
        ).value = data.name;



        document.querySelector(
            '[name="surcharge"]'
        ).value = data.surcharge;




        // CHANGE BUTTON
        document.getElementById(
            "save_category"
        ).innerHTML = `

            <i class='bx bx-save'></i>

            Update category

        `;

    }

    catch(error){

        console.log(
            "edit category error:",
            error
        );

    }

});




// ========================================
// CATEGORY AJAX SUBMIT
// ========================================

document.addEventListener(
    "submit",
    async function(e){

    if(

        e.target &&

        e.target.id ===
        "categoryForm"

    ){

        e.preventDefault();




        const form =
        e.target;

        const formData =
        new FormData(form);




        // REMOVE OLD ERRORS
        form
        .querySelectorAll(
            ".input_error"
        )
        .forEach(input => {

            input.classList.remove(
                "input_error"
            );

        });




        // URL
        let url =
        "/api/add-category/";



        // UPDATE
        if(

            document.getElementById(
                "category_id"
            ).value

        ){

            url =
            "/api/update-category/";

        }




        try{

            const response =
            await fetch(url, {

                method:"POST",

                body:formData,

                headers:{
                    "X-Requested-With":
                    "XMLHttpRequest"
                }

            });




            const data =
            await response.json();

            console.log(data);




            // ERRORS
            if(!data.success){

                for(

                    const field
                    in data.errors

                ){

                    const input =
                    form.querySelector(

                        `[name="${field}"]`

                    );

                    if(input){

                        input.classList.add(
                            "input_error"
                        );

                    }

                }



                showAlert(

                    "Please fill all required fields",

                    "error"

                );

                return;

            }




            // SUCCESS
            showAlert(

                data.message,

                "success"

            );




            // CLOSE MODAL
            document
            .getElementById(
                "categoryModal"
            )
            .classList.remove(
                "show"
            );




            // RESET FORM
            form.reset();




            // RESET ID
            document
            .getElementById(
                "category_id"
            ).value = "";




            // RESET BUTTON
            document
            .getElementById(
                "save_category"
            ).innerHTML = `

                <i class='bx bx-save'></i>

                Save category

            `;




            // RELOAD CATEGORY PAGE
            loadPage(
                "/panel/categories/"
            );

        }

        catch(error){

            console.log(
                "category error:",
                error
            );



            showAlert(

                "Something went wrong",

                "error"

            );

        }

    }

});



// ========================================
// OPEN CONTACT MODAL
// ========================================

document.addEventListener("click", function(e){

    const openBtn =
    e.target.closest("#openContactModal");

    if(!openBtn) return;

    const popup =
    document.querySelector(".add_contact");

    const overlay =
    document.querySelector(".contact_overlay");

    if(popup){

        popup.classList.add("active");

    }

    if(overlay){

        overlay.classList.add("active");

    }



    // RESET FORM
    const form =
    document.getElementById("contactForm");

    if(form){

        form.reset();

    }



    // RESET ID
    const contactId =
    document.getElementById("contact_id");

    if(contactId){

        contactId.value = "";

    }



    // RESET BUTTON
    const btn =
    document.getElementById("saveContactBtn");

    if(btn){

        btn.innerHTML = `

            <i class='bx bx-save'></i>

            Save Contact

        `;

    }

});



// ========================================
// EDIT CONTACT
// ========================================

document.addEventListener(
    "click",
    async function(e){

    const editBtn =
    e.target.closest(
        ".edit_contact_btn"
    );

    if(!editBtn) return;

    e.preventDefault();




    const contactId =
    editBtn.dataset.id;

    console.log(
        "editing contact:",
        contactId
    );




    try{

        const response =
        await fetch(

            `/api/edit-contact/${contactId}/`

        );



        const data =
        await response.json();

        console.log(data);




        // OPEN MODAL
        const popup =
        document.querySelector(
            ".add_contact"
        );

        const overlay =
        document.querySelector(
            ".contact_overlay"
        );



        popup?.classList.add(
            "active"
        );

        overlay?.classList.add(
            "active"
        );




        // CONTACT ID
        document.getElementById(
            "contact_id"
        ).value = data.id;




        // NAME
        document.querySelector(
            '[name="name"]'
        ).value = data.name || "";




        // PHONE
        document.querySelector(
            '[name="phone"]'
        ).value = data.phone || "";




        // EMAIL
        document.querySelector(
            '[name="email"]'
        ).value = data.email || "";




        // ADDRESS
        document.querySelector(
            '[name="address"]'
        ).value = data.address || "";




        // GUEST
        document.querySelector(
            '[name="is_guest"]'
        ).checked = data.is_guest;




        // USER SELECT
        if(data.user){

            // USER ID
            document.getElementById(
                "userHiddenInput2"
            ).value = data.user;



            // USER NAME
            document.getElementById(
                "selectedUserText2"
            ).innerText =
            data.user_name;

        }

        else{

            // RESET USER
            document.getElementById(
                "userHiddenInput2"
            ).value = "";



            document.getElementById(
                "selectedUserText2"
            ).innerText =
            "select user (optional)";

        }




        // TITLE
        const title =
        document.getElementById(
            "contactModalTitle"
        );

        if(title){

            title.innerText =
            "Update Contact";

        }




        // UPDATE BUTTON
        document.getElementById(
            "saveContactBtn"
        ).innerHTML = `

            <i class='bx bx-save'></i>

            Update Contact

        `;

    }

    catch(error){

        console.log(
            "edit contact error:",
            error
        );

    }

});



// =======================
// 🔥 CONTACT DELETE STATE
// =======================

let contactDeleteRows = [];
let contactDeleteUrls = [];



// =======================
// 🔓 OPEN DELETE MODAL
// =======================

function openContactDeleteModal(rows, urls){

    contactDeleteRows = rows;

    contactDeleteUrls = urls;



    const modal =
    document.getElementById(
        "deleteModal"
    );



    const msg =
    document.getElementById(
        "deleteMessage"
    );



    if (!modal) return;



    // SINGLE
    if (urls.length === 1){

        msg.innerText =
        "Are you sure you want to delete this contact?";

    }

    // BULK
    else{

        msg.innerText =
        `Are you sure you want to delete ${urls.length} contacts?`;

    }



    modal.classList.remove(
        "hidden"
    );

}



// =======================
// 🔒 CLOSE DELETE MODAL
// =======================

function closeContactDeleteModal(){

    const modal =
    document.getElementById(
        "deleteModal"
    );



    if (modal){

        modal.classList.add(
            "hidden"
        );

    }



    contactDeleteRows = [];

    contactDeleteUrls = [];

}



// =======================
// 🎯 CLICK HANDLER
// =======================

document.addEventListener(
    "click",
    function(e){

    // ===================
    // SINGLE DELETE
    // ===================
    const singleDelete =
    e.target.closest(
        '.contact_management [data-action="delete"]'
    );



    if (singleDelete){

        const row =
        singleDelete.closest(
            "tr"
        );



        const url =
        singleDelete.dataset.url;



        if (!row || !url){

            console.error(
                "Missing row or url"
            );

            return;

        }



        openContactDeleteModal(

            [row],

            [url]

        );



        return;

    }



    // ===================
    // BULK DELETE
    // ===================
    const bulkDelete =
    e.target.closest(
        "#deleteSelectedContact"
    );



    if (bulkDelete){

        const checked =
        document.querySelectorAll(
            ".contact_management .rowCheck:checked"
        );



        if (checked.length === 0){

            showAlert(
                "Select at least one contact",
                "error"
            );

            return;

        }



        let rows = [];

        let urls = [];



        checked.forEach(cb => {

            const row =
            cb.closest("tr");



            if (!row) return;



            // 🔥 URL FROM CHECKBOX
            const url =
            cb.dataset.url;



            if (!url){

                console.warn(
                    "url not found"
                );

                return;

            }



            rows.push(row);

            urls.push(url);

        });



        console.log(
            "CONTACT BULK URLS:",
            urls
        );



        openContactDeleteModal(
            rows,
            urls
        );



        return;

    }



    // ===================
    // CANCEL
    // ===================
    if (
        e.target.id ===
        "cancelDelete"
    ){

        closeContactDeleteModal();

    }



    // ===================
    // CLICK OUTSIDE
    // ===================
    if (
        e.target.id ===
        "deleteModal"
    ){

        closeContactDeleteModal();

    }

});




// =======================
// ❌ CONFIRM DELETE
// =======================

function initDeleteContact(){

    const btn =
    document.getElementById(
        "confirmDelete"
    );



    if (!btn) return;



    // 🔥 PREVENT MULTIPLE BINDS
    if(btn.dataset.contactBound) return;

    btn.dataset.contactBound = "true";



    btn.addEventListener(
        "click",
        async function(){

        if (
            contactDeleteUrls.length === 0
        ){

            console.warn(
                "nothing to delete"
            );

            return;

        }



        try{

            // DELETE ONE BY ONE
            for (
                const url
                of contactDeleteUrls
            ){

                console.log(
                    "DELETING:",
                    url
                );



                const res =
                await fetch(url, {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie("csrftoken"),

                    }

                });



                const data =
                await res.json();

                console.log(
                    "DELETE RESPONSE:",
                    data
                );

            }



            // REMOVE ROWS
            contactDeleteRows
            .forEach(row => {

                row.style.opacity = "0";



                setTimeout(() => {

                    row.remove();

                }, 300);

            });



            showAlert(
                "Contact deleted successfully",
                "success"
            );

        }

        catch(err){

            console.error(err);



            showAlert(
                "Delete failed",
                "error"
            );

        }

        finally{

            closeContactDeleteModal();

        }

    });

}



// =======================
// 🔥 INIT
// =======================

initDeleteContact();






// ========================================
// OPEN PRICING MODAL
// ========================================

document.addEventListener(
    "click",
    function(e){

    // OPEN
    if(
        e.target.closest(
            "#openPricingModal"
        )
    ){

        const modal =
        document.getElementById(
            "pricingModal"
        );



        modal?.classList.add(
            "show"
        );



        // RESET FORM
        const form =
        document.getElementById(
            "pricingForm"
        );



        form?.reset();



        // RESET ID
        document.getElementById(
            "pricing_id"
        ).value = "";



        // RESET TITLE
        document.getElementById(
            "pricingModalTitle"
        ).innerText =
        "Pricing information";



        // RESET BUTTON
        document.getElementById(
            "save_pricing"
        ).innerHTML = `

            <i class='bx bx-save'></i>

            Save pricing

        `;

    }




    // CLOSE
    if(

        e.target.closest(
            "#closePricingModal"
        )

        ||

        e.target.closest(
            "#cancelPricing"
        )

    ){

        document.getElementById(
            "pricingModal"
        )?.classList.remove(
            "show"
        );

    }

});


// ========================================
// PRICING SUBMIT
// ========================================

document.addEventListener(
    "submit",
    async function(e){

    // TARGET FORM
    if(

        e.target

        &&

        e.target.id ===
        "pricingForm"

    ){

        e.preventDefault();




        const form =
        e.target;




        const formData =
        new FormData(form);




        // 🔥 CREATE OR UPDATE
        const pricingId =
        document.getElementById(
            "pricing_id"
        ).value;




        let url =
        "/api/create-pricing-rule/";




        // UPDATE
        if(pricingId){

            url =
            "/api/update-pricing-rule/";

        }




        console.log(
            Object.fromEntries(formData)
        );




        try{

            const response =
            await fetch(

                url,

                {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie(
                            "csrftoken"
                        ),

                        "X-Requested-With":
                        "XMLHttpRequest"

                    },

                    body: formData

                }

            );




            const data =
            await response.json();




            console.log(data);




            // ERROR
            if(!data.success){

                showAlert(

                    "Please fill all fields",

                    "error"

                );

                return;

            }




            // SUCCESS
            showAlert(

                data.message,

                "success"

            );




            // RESET
            form.reset();




            // RESET ID
            document.getElementById(
                "pricing_id"
            ).value = "";




            // RESET TITLE
            document.getElementById(
                "pricingModalTitle"
            ).innerText =
            "Pricing information";




            // RESET BUTTON
            document.getElementById(
                "save_pricing"
            ).innerHTML = `

                <i class='bx bx-save'></i>

                Save pricing

            `;




            // CLOSE MODAL
            document.getElementById(
                "pricingModal"
            )?.classList.remove(
                "show"
            );




            // RELOAD PAGE
            loadPage(
                "/panel/pricing-rules/"
            );

        }

        catch(error){

            console.log(
                "pricing submit error:",
                error
            );




            showAlert(

                "Something went wrong",

                "error"

            );

        }

    }

});



// ========================================
// EDIT PRICING RULE
// ========================================

document.addEventListener(
    "click",
    async function(e){

    const editBtn =
    e.target.closest(
        ".edit_pricing_btn"
    );



    if(!editBtn) return;

    e.preventDefault();




    const pricingId =
    editBtn.dataset.id;




    console.log(
        "editing pricing:",
        pricingId
    );




    try{

        const response =
        await fetch(

            `/api/edit-pricing-rule/${pricingId}/`

        );



        const data =
        await response.json();




        console.log(data);




        // OPEN MODAL
        document.getElementById(
            "pricingModal"
        )?.classList.add(
            "show"
        );




        // ID
        document.getElementById(
            "pricing_id"
        ).value = data.id;




        // SHIPPING TYPE
        document.querySelector(
            '[name="shipping_type"]'
        ).value =
        data.shipping_type;




        // PRICE
        document.querySelector(
            '[name="price_per_lb"]'
        ).value =
        data.price_per_lb;




        // VOLUME
        document.querySelector(
            '[name="volumetric_divisor"]'
        ).value =
        data.volumetric_divisor;




        // MINIMUM
        document.querySelector(
            '[name="minimum_charge"]'
        ).value =
        data.minimum_charge;




        // TITLE
        document.getElementById(
            "pricingModalTitle"
        ).innerText =
        "Update pricing rule";




        // BUTTON
        document.getElementById(
            "save_pricing"
        ).innerHTML = `

            <i class='bx bx-save'></i>

            Update pricing

        `;

    }

    catch(error){

        console.log(
            "pricing edit error:",
            error
        );

    }

});



// =======================
// 🔥 PRICING DELETE STATE
// =======================

let pricingDeleteRows = [];
let pricingDeleteUrls = [];




// =======================
// 🔓 OPEN DELETE MODAL
// =======================

function openPricingDeleteModal(rows, urls){

    pricingDeleteRows = rows;

    pricingDeleteUrls = urls;




    const modal =
    document.getElementById(
        "deleteModal"
    );



    const msg =
    document.getElementById(
        "deleteMessage"
    );



    if (!modal) return;




    // SINGLE
    if (urls.length === 1){

        msg.innerText =
        "Are you sure you want to delete this pricing rule?";

    }

    // BULK
    else{

        msg.innerText =
        `Are you sure you want to delete ${urls.length} pricing rules?`;

    }




    modal.classList.remove(
        "hidden"
    );

}




// =======================
// 🔒 CLOSE MODAL
// =======================

function closePricingDeleteModal(){

    const modal =
    document.getElementById(
        "deleteModal"
    );



    if (modal){

        modal.classList.add(
            "hidden"
        );

    }




    pricingDeleteRows = [];

    pricingDeleteUrls = [];

}




// =======================
// 🎯 CLICK HANDLER
// =======================

document.addEventListener(
    "click",
    function(e){

    // ===================
    // SINGLE DELETE
    // ===================
    const singleDelete =
    e.target.closest(
        '.pricing_management [data-action="delete"]'
    );



    if (singleDelete){

        const row =
        singleDelete.closest(
            "tr"
        );



        const url =
        singleDelete.dataset.url;




        if (!row || !url){

            console.error(
                "Missing row or url"
            );

            return;

        }




        openPricingDeleteModal(

            [row],

            [url]

        );



        return;

    }




    // ===================
    // BULK DELETE
    // ===================
    const bulkDelete =
    e.target.closest(
        "#deleteSelectedPricing"
    );



    if (bulkDelete){

        const checked =
        document.querySelectorAll(
            ".pricing_management .rowCheck:checked"
        );




        if (checked.length === 0){

            showAlert(

                "Select at least one pricing rule",

                "error"

            );

            return;

        }




        let rows = [];

        let urls = [];




        checked.forEach(cb => {

            const row =
            cb.closest("tr");



            if (!row) return;




            const url =
            cb.dataset.url;



            if (!url) return;




            rows.push(row);

            urls.push(url);

        });




        console.log(
            "PRICING BULK URLS:",
            urls
        );




        openPricingDeleteModal(
            rows,
            urls
        );



        return;

    }




    // ===================
    // CANCEL
    // ===================
    if (
        e.target.id ===
        "cancelDelete"
    ){

        closePricingDeleteModal();

    }




    // ===================
    // CLICK OUTSIDE
    // ===================
    if (
        e.target.id ===
        "deleteModal"
    ){

        closePricingDeleteModal();

    }

});




// =======================
// ❌ CONFIRM DELETE
// =======================

function initDeletePricing(){

    const btn =
    document.getElementById(
        "confirmDelete"
    );



    if (!btn) return;




    // 🔥 PREVENT MULTIPLE BINDS
    if(btn.dataset.pricingBound) return;

    btn.dataset.pricingBound = "true";




    btn.addEventListener(
        "click",
        async function(){

        if (
            pricingDeleteUrls.length === 0
        ){

            console.warn(
                "nothing to delete"
            );

            return;

        }




        try{

            // DELETE ONE BY ONE
            for (
                const url
                of pricingDeleteUrls
            ){

                console.log(
                    "DELETING:",
                    url
                );



                const res =
                await fetch(url, {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie("csrftoken"),

                    }

                });



                const data =
                await res.json();

                console.log(
                    "DELETE RESPONSE:",
                    data
                );

            }




            // REMOVE ROWS
            pricingDeleteRows
            .forEach(row => {

                row.style.opacity = "0";



                setTimeout(() => {

                    row.remove();

                }, 300);

            });




            showAlert(

                "Pricing rule deleted successfully",

                "success"

            );

        }

        catch(err){

            console.error(err);




            showAlert(

                "Delete failed",

                "error"

            );

        }

        finally{

            closePricingDeleteModal();

        }

    });

}



// INIT
initDeletePricing();





// ========================================
// ROUTE PRICING SUBMIT
// ========================================

document.addEventListener(
    "submit",
    async function(e){

    if(

        e.target

        &&

        e.target.id ===
        "routePricingForm"

    ){

        e.preventDefault();




        const form =
        e.target;




        const formData =
        new FormData(form);




        // CREATE OR UPDATE
        const routeId =
        document.getElementById(
            "route_id"
        ).value;




        let url =
        "/api/create-route-pricing/";




        if(routeId){

            url =
            "/api/update-route-pricing/";

        }




        try{

            const response =
            await fetch(

                url,

                {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie(
                            "csrftoken"
                        ),

                        "X-Requested-With":
                        "XMLHttpRequest"

                    },

                    body: formData

                }

            );




            const data =
            await response.json();




            if(!data.success){

                showAlert(

                    "Please fill all fields",

                    "error"

                );

                return;

            }




            showAlert(

                data.message,

                "success"

            );




            form.reset();




            document.getElementById(
                "route_id"
            ).value = "";




            document.getElementById(
                "routePricingModal"
            )?.classList.remove(
                "show"
            );




            loadPage(
                "/panel/route-pricings/"
            );

        }

        catch(error){

            console.log(
                "route pricing error:",
                error
            );




            showAlert(

                "Something went wrong",

                "error"

            );

        }

    }

});


// ========================================
// ROUTE PRICING SUBMIT
// ========================================



document.addEventListener(
    "click",
    function(e){

    // =================================
    // OPEN MODAL
    // =================================
    if(
        e.target.closest(
            "#openRoutePricingModal"
        )
    ){

        const modal =
        document.getElementById(
            "routePricingModal"
        );



        modal?.classList.add(
            "show"
        );



        // RESET FORM
        const form =
        document.getElementById(
            "routePricingForm"
        );



        form?.reset();




        // RESET ID
        document.getElementById(
            "route_id"
        ).value = "";




        // RESET TITLE
        document.getElementById(
            "routePricingTitle"
        ).innerText =

        "Route pricing information";




        // RESET BUTTON
        document.getElementById(
            "save_route_pricing"
        ).innerHTML = `

            <i class='bx bx-save'></i>

            Save Route Pricing

        `;

    }




    // =================================
    // CLOSE MODAL
    // =================================
    if(

        e.target.closest(
            "#closeRoutePricingModal"
        )

        ||

        e.target.closest(
            "#cancelRoutePricing"
        )

    ){

        document.getElementById(
            "routePricingModal"
        )?.classList.remove(
            "show"
        );

    }

});



document.addEventListener(
    "submit",
    async function(e){

    if(

        e.target

        &&

        e.target.id ===
        "routePricingForm"

    ){

        e.preventDefault();




        const form =
        e.target;




        const formData =
        new FormData(form);




        // CREATE OR UPDATE
        const routeId =
        document.getElementById(
            "route_id"
        ).value;




        let url =
        "/api/create-route-pricing/";




        if(routeId){

            url =
            "/api/update-route-pricing/";

        }




        try{

            const response =
            await fetch(

                url,

                {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie(
                            "csrftoken"
                        ),

                        "X-Requested-With":
                        "XMLHttpRequest"

                    },

                    body: formData

                }

            );




            const data =
            await response.json();




            if(!data.success){

                showAlert(

                    "Please fill all fields",

                    "error"

                );

                return;

            }




            showAlert(

                data.message,

                "success"

            );




            form.reset();




            document.getElementById(
                "route_id"
            ).value = "";




            document.getElementById(
                "routePricingModal"
            )?.classList.remove(
                "show"
            );




            loadPage(
                "/panel/route-pricings/"
            );

        }

        catch(error){

            console.log(
                "route pricing error:",
                error
            );




            showAlert(

                "Something went wrong",

                "error"

            );

        }

    }

});



// =======================
// ROUTE DELETE STATE
// =======================

let routeDeleteRows = [];
let routeDeleteUrls = [];



// OPEN
function openRouteDeleteModal(rows, urls){

    routeDeleteRows = rows;

    routeDeleteUrls = urls;



    const modal =
    document.getElementById(
        "deleteModal"
    );



    const msg =
    document.getElementById(
        "deleteMessage"
    );



    if(urls.length === 1){

        msg.innerText =
        "Are you sure you want to delete this route pricing?";

    }

    else{

        msg.innerText =
        `Are you sure you want to delete ${urls.length} route pricings?`;

    }



    modal.classList.remove(
        "hidden"
    );

}



// CLOSE
function closeRouteDeleteModal(){

    document.getElementById(
        "deleteModal"
    )?.classList.add(
        "hidden"
    );



    routeDeleteRows = [];
    routeDeleteUrls = [];

}



// CLICK
document.addEventListener(
    "click",
    function(e){

    // SINGLE
    const singleDelete =
    e.target.closest(
        '.route_pricing_management [data-action="delete"]'
    );



    if(singleDelete){

        openRouteDeleteModal(

            [
                singleDelete.closest("tr")
            ],

            [
                singleDelete.dataset.url
            ]

        );



        return;

    }



    // BULK
    const bulkDelete =
    e.target.closest(
        "#deleteSelectedRoute"
    );



    if(bulkDelete){

        const checked =
        document.querySelectorAll(
            ".route_pricing_management .rowCheck:checked"
        );



        if(checked.length === 0){

            showAlert(

                "Select at least one route pricing",

                "error"

            );

            return;

        }



        let rows = [];
        let urls = [];



        checked.forEach(cb => {

            rows.push(
                cb.closest("tr")
            );



            urls.push(
                cb.dataset.url
            );

        });



        openRouteDeleteModal(
            rows,
            urls
        );

    }



    // CANCEL
    if(
        e.target.id ===
        "cancelDelete"
    ){

        closeRouteDeleteModal();

    }



    // OUTSIDE
    if(
        e.target.id ===
        "deleteModal"
    ){

        closeRouteDeleteModal();

    }

});



// CONFIRM
function initDeleteRoutePricing(){

    const btn =
    document.getElementById(
        "confirmDelete"
    );



    if(!btn) return;



    if(btn.dataset.routeBound) return;

    btn.dataset.routeBound = "true";



    btn.addEventListener(
        "click",
        async function(){

        if(
            routeDeleteUrls.length === 0
        ) return;




        try{

            for(
                const url
                of routeDeleteUrls
            ){

                await fetch(url, {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie(
                            "csrftoken"
                        ),

                    }

                });

            }




            routeDeleteRows.forEach(row => {

                row.style.opacity = "0";



                setTimeout(() => {

                    row.remove();

                }, 300);

            });




            showAlert(

                "Route pricing deleted successfully",

                "success"

            );

        }

        catch(error){

            console.log(error);




            showAlert(

                "Delete failed",

                "error"

            );

        }

        finally{

            closeRouteDeleteModal();

        }

    });

}



initDeleteRoutePricing();



// ========================================
// EDIT ROUTE PRICING
// ========================================

document.addEventListener(
    "click",
    async function(e){

    const editBtn =
    e.target.closest(
        ".edit_route_btn"
    );



    if(!editBtn) return;

    e.preventDefault();




    const routeId =
    editBtn.dataset.id;




    console.log(
        "editing route:",
        routeId
    );




    try{

        const response =
        await fetch(

            `/api/edit-route-pricing/${routeId}/`

        );



        const data =
        await response.json();




        console.log(data);




        // =================================
        // OPEN MODAL
        // =================================
        const modal =
        document.getElementById(
            "routePricingModal"
        );



        modal?.classList.add(
            "show"
        );




        // =================================
        // SET ID
        // =================================
        document.getElementById(
            "route_id"
        ).value =
        data.id;




        // =================================
        // ORIGIN
        // =================================
        document.querySelector(
            '[name="origin_type"]'
        ).value =
        data.origin_type;




        // =================================
        // DESTINATION
        // =================================
        document.querySelector(
            '[name="destination_type"]'
        ).value =
        data.destination_type;




        // =================================
        // SHIPPING
        // =================================
        document.querySelector(
            '[name="shipping_type"]'
        ).value =
        data.shipping_type;




        // =================================
        // PRICE
        // =================================
        document.querySelector(
            '[name="price_per_lb"]'
        ).value =
        data.price_per_lb;




        // =================================
        // TITLE
        // =================================
        document.getElementById(
            "routePricingTitle"
        ).innerText =

        "Update Route Pricing";




        // =================================
        // BUTTON
        // =================================
        document.getElementById(
            "save_route_pricing"
        ).innerHTML = `

            <i class='bx bx-save'></i>

            Update Route Pricing

        `;

    }

    catch(error){

        console.log(
            "route edit error:",
            error
        );

    }

});


// =====================================
// CALCULATOR
// =====================================

// =====================================
// CALCULATOR
// =====================================

document.addEventListener(
    "click",
    async function(e){

    // =====================================
    // CALCULATE BUTTON
    // =====================================

    if(

        e.target.id ===
        "calculateShipment"

        ||

        e.target.closest(
            "#calculateShipment"
        )

    ){

        // =================================
        // GET VALUES
        // =================================

        const origin =
        document.getElementById(
            "fromCountry"
        )?.value;




        const destination =
        document.getElementById(
            "toCountry"
        )?.value;




        const shippingType =
        document.getElementById(
            "shippingType"
        )?.value;




        const category =
        document.getElementById(
            "packageCategory"
        )?.value;




        const weight =
        document.getElementById(
            "weight"
        )?.value;




        const length =
        document.getElementById(
            "length"
        )?.value;




        const width =
        document.getElementById(
            "width"
        )?.value;




        const height =
        document.getElementById(
            "height"
        )?.value;




        const quantity =
        document.getElementById(
            "quantity"
        )?.value;




        const insurance =
        document.getElementById(
            "insurance"
        )?.value;




        // =================================
        // VALIDATION
        // =================================

        if(

            !origin ||

            !destination ||

            !shippingType ||

            !weight

        ){

            showAlert(

                "Please fill required fields",

                "error"

            );

            return;

        }




        // =================================
        // CSRF
        // =================================

        const csrfToken =
        document.querySelector(
            '[name=csrfmiddlewaretoken]'
        )?.value;




        // =================================
        // FORM DATA
        // =================================

        const formData =
        new FormData();




        formData.append(
            "origin",
            origin
        );



        formData.append(
            "destination",
            destination
        );



        formData.append(
            "shipping_type",
            shippingType
        );



        formData.append(
            "category",
            category
        );



        formData.append(
            "weight",
            weight
        );



        formData.append(
            "length",
            length
        );



        formData.append(
            "width",
            width
        );



        formData.append(
            "height",
            height
        );



        formData.append(
            "quantity",
            quantity || 1
        );



        formData.append(
            "insurance",
            insurance
        );




        // =================================
        // BUTTON
        // =================================

        const btn =
        document.getElementById(
            "calculateShipment"
        );



        btn.disabled = true;



        btn.innerHTML = `

            <i class='bx bx-loader-alt bx-spin'></i>

            Calculating...

        `;




        // =================================
        // FETCH
        // =================================

        try{

            const response =
            await fetch(

                "/panel/calculator/",

                {

                    method:"POST",

                    body:formData,

                    headers:{

                        "X-CSRFToken":
                        csrfToken,

                        "X-Requested-With":
                        "XMLHttpRequest"

                    }

                }

            );




            const data =
            await response.json();




            // =============================
            // RESET BUTTON
            // =============================

            btn.disabled = false;



            btn.innerHTML = `

                <i class='bx bx-calculator'></i>

                Calculate Price

            `;




            // =============================
            // ERROR
            // =============================

            if(!data.success){

                showAlert(

                    data.error ||

                    "Calculation failed",

                    "error"

                );

                return;

            }




       // =============================
// SHOW SUMMARY
// =============================

const summary =
document.querySelector(
    ".calculator_summary"
);



// 🔥 SHOW AFTER UPDATE
if(summary){

    // reset animation
    summary.classList.remove(
        "active"
    );



    // force reflow
    void summary.offsetWidth;



    // 🔥 wait little for smooth deploy
    setTimeout(() => {

        summary.classList.add(
            "active"
        );



        summary.scrollIntoView({

            behavior:"smooth",

            block:"start"

        });

    }, 100);

}



            // =============================
            // SAFE UPDATE
            // =============================

            function updateText(
                id,
                value
            ){

                const el =
                document.getElementById(
                    id
                );



                if(el){

                    el.innerText =
                    value;

                }

            }




            // =============================
            // UPDATE UI
            // =============================

            updateText(

                "basePrice",

                "$" +

                Number(
                    data.base_price
                ).toFixed(2)

            );



            updateText(

                "insurancePrice",

                "$" +

                Number(
                    data.insurance_price
                ).toFixed(2)

            );



            updateText(

                "qtyPrice",

                quantity || 1

            );



            updateText(

                "sum_price",

                "$" +

                Number(
                    data.total
                ).toFixed(2)

            );



            updateText(

                "finalTotal",

                "$" +

                Number(
                    data.total
                ).toFixed(2)

            );



            updateText(

                "deliveryTime",

                data.delivery_time

            );



            updateText(

                "deliveryTime2",

                data.delivery_time

            );




            // =============================
            // SUCCESS
            // =============================

            showAlert(

                "Price calculated successfully",

                "success"

            );




            // =============================
            // RESET FORM
            // =============================

            document.getElementById(
                "weight"
            ).value = "";



            document.getElementById(
                "length"
            ).value = "";



            document.getElementById(
                "width"
            ).value = "";



            document.getElementById(
                "height"
            ).value = "";



            document.getElementById(
                "quantity"
            ).value = 1;




            // =============================
            // SCROLL RESULT
            // =============================

            summary?.scrollIntoView({

                behavior:"smooth"

            });

        }

        catch(error){

            console.log(
                "calculator error:",
                error
            );




            btn.disabled = false;



            btn.innerHTML = `

                <i class='bx bx-calculator'></i>

                Calculate Price

            `;




            showAlert(

                "Something went wrong",

                "error"

            );

        }

    }




    // =====================================
    // RESET CALCULATOR
    // =====================================

    if(

        e.target.id ===
        "resetCalculator"

        ||

        e.target.closest(
            "#resetCalculator"
        )

    ){

        // RESET INPUTS
        document.getElementById(
            "fromCountry"
        ).selectedIndex = 0;



        document.getElementById(
            "toCountry"
        ).selectedIndex = 0;



        document.getElementById(
            "shippingType"
        ).selectedIndex = 0;



        document.getElementById(
            "packageCategory"
        ).selectedIndex = 0;



        document.getElementById(
            "weight"
        ).value = "";



        document.getElementById(
            "length"
        ).value = "";



        document.getElementById(
            "width"
        ).value = "";



        document.getElementById(
            "height"
        ).value = "";



        document.getElementById(
            "quantity"
        ).value = 1;



        document.getElementById(
            "insurance"
        ).value = "no";




        // RESET UI
        document.getElementById(
            "basePrice"
        ).innerText = "$0.00";



        document.getElementById(
            "insurancePrice"
        ).innerText = "$0.00";



        document.getElementById(
            "qtyPrice"
        ).innerText = "1";



        document.getElementById(
            "sum_price"
        ).innerText = "$0.00";



        document.getElementById(
            "finalTotal"
        ).innerText = "$0.00";



        document.getElementById(
            "deliveryTime"
        ).innerText =
        "3 - 5 Business Days";



        document.getElementById(
            "deliveryTime2"
        ).innerText =
        "3 - 5 Days";




        // HIDE SUMMARY
        document.querySelector(
            ".calculator_summary"
        )?.classList.remove(
            "show"
        );




        showAlert(

            "Calculator reset successfully",

            "success"

        );

    }

});





// =========================
// KYC DECISION
// =========================

document.addEventListener(
    "click",
    async function(e){

    // button
    const submitBtn =
    e.target.closest(
        ".submit_decision"
    );


    // no button
    if(!submitBtn) return;



    // =========================
    // SELECT DECISION
    // =========================

    const selectedDecision =
    document.querySelector(
        'input[name="decision"]:checked'
    );



    if(!selectedDecision){

        showAlert(

            "Please select a decision",

            "error"

        );

        return;

    }



    // =========================
    // VALUES
    // =========================

    const decision =
    selectedDecision.value;



    const comment =
    document.getElementById(
        "comment-kyc"
    ).value.trim();




    // =========================
    // REQUIRE COMMENT
    // =========================

    if(

        decision === "rejected"

        &&

        comment === ""

    ){

        showAlert(

            "Comment required for rejection",

            "error"

        );

        return;

    }




    // =========================
    // KYC ID
    // =========================

    const kycId =
    submitBtn.dataset.id;




    // =========================
    // LOADING
    // =========================

    submitBtn.disabled =
    true;



    submitBtn.innerHTML = `

        Processing...

    `;




    try{

        // =========================
        // REQUEST
        // =========================

        const response =
        await fetch(

            `/api/admin/kyc-decision/${kycId}/`,

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json",

                    "X-CSRFToken":
                    getCookie(
                        "csrftoken"
                    ),

                    "X-Requested-With":
                    "XMLHttpRequest"

                },

                body:JSON.stringify({

                    decision:
                    decision,

                    comment:
                    comment

                })

            }

        );




        const data =
        await response.json();




        // =========================
        // ERROR
        // =========================

        if(!data.success){

            showAlert(

                data.error ||

                "Something went wrong",

                "error"

            );

            return;

        }




        // =========================
        // SUCCESS
        // =========================

        showAlert(

            data.message,

            "success"

        );




        // reload SPA
        setTimeout(() => {

            loadPage(
                "/panel/kyc-management/"
            );

        }, 1200);

    }

    catch(error){

        console.log(
            "kyc decision error:",
            error
        );



        showAlert(

            "Server error",

            "error"

        );

    }



    // =========================
    // RESET BUTTON
    // =========================

    finally{

        submitBtn.disabled =
        false;



        submitBtn.innerHTML = `

            <i class='bx bx-send'></i>

            Submit Decision

        `;

    }

});

// nitifikasyon kyc


// =========================
// KYC NOTIFICATION COUNT
// =========================
async function loadKYCNotice(){

    try{

        const response =
        await fetch(

            "/api/kyc-pending-count/"

        );



        const data =
        await response.json();



        const notice =
        document.querySelector(
            ".notice-kyc"
        );



        if(!notice) return;




        // hide if 0
        if(data.count <= 0){

            notice.style.display =
            "none";

        }

        else{

            notice.style.display =
            "inline-flex";

            notice.textContent =
            `(${data.count})`;

        }

    }

    catch(error){

        console.log(
            "kyc notice error:",
            error
        );

    }

}



// run
loadKYCNotice();



// delete kycs
// =======================
// KYC DELETE STATE
// =======================

let kycDeleteRows = [];
let kycDeleteUrls = [];



// OPEN
function openKYCDeleteModal(rows, urls){

    kycDeleteRows = rows;

    kycDeleteUrls = urls;



    const modal =
    document.getElementById(
        "deleteModal"
    );



    const msg =
    document.getElementById(
        "deleteMessage"
    );



    if(urls.length === 1){

        msg.innerText =
        "Are you sure you want to delete this KYC?";

    }

    else{

        msg.innerText =
        `Are you sure you want to delete ${urls.length} KYC records?`;

    }



    modal.classList.remove(
        "hidden"
    );

}



// CLOSE
function closeKYCDeleteModal(){

    document.getElementById(
        "deleteModal"
    )?.classList.add(
        "hidden"
    );



    kycDeleteRows = [];
    kycDeleteUrls = [];

}



// CLICK
document.addEventListener(
    "click",
    function(e){

    // SINGLE
    const singleDelete =
    e.target.closest(
        '.kyc_management [data-action="delete"]'
    );



    if(singleDelete){

        openKYCDeleteModal(

            [
                singleDelete.closest("tr")
            ],

            [
                singleDelete.dataset.url
            ]

        );



        return;

    }



    // BULK
    const bulkDelete =
    e.target.closest(
        "#deleteSelectedKYC"
    );



    if(bulkDelete){

        const checked =
        document.querySelectorAll(
            ".kyc_management .rowCheck:checked"
        );



        if(checked.length === 0){

            showAlert(

                "Select at least one KYC",

                "error"

            );

            return;

        }



        let rows = [];
        let urls = [];



        checked.forEach(cb => {

            rows.push(
                cb.closest("tr")
            );



            urls.push(
                cb.dataset.url
            );

        });



        openKYCDeleteModal(
            rows,
            urls
        );

    }



    // CANCEL
    if(
        e.target.id ===
        "cancelDelete"
    ){

        closeKYCDeleteModal();

    }



    // OUTSIDE
    if(
        e.target.id ===
        "deleteModal"
    ){

        closeKYCDeleteModal();

    }

});



// CONFIRM
function initDeleteKYC(){

    const btn =
    document.getElementById(
        "confirmDelete"
    );



    if(!btn) return;



    if(btn.dataset.kycBound) return;

    btn.dataset.kycBound = "true";



    btn.addEventListener(
        "click",
        async function(){

        if(
            kycDeleteUrls.length === 0
        ) return;




        try{

            for(
                const url
                of kycDeleteUrls
            ){

                await fetch(url, {

                    method: "POST",

                    headers: {

                        "X-CSRFToken":
                        getCookie(
                            "csrftoken"
                        ),

                    }

                });

            }




            kycDeleteRows.forEach(row => {

                row.style.opacity = "0";



                setTimeout(() => {

                    row.remove();

                }, 300);

            });




            showAlert(

                "KYC deleted successfully",

                "success"

            );

        }

        catch(error){

            console.log(error);




            showAlert(

                "Delete failed",

                "error"

            );

        }

        finally{

            closeKYCDeleteModal();

        }

    });

}



initDeleteKYC();



// =====================================
// SHIPMENT SEARCH
// =====================================

document.addEventListener(

    "click",

    function(e){

        const btn =
        e.target.closest(
            ".search-btn"
        );



        if(!btn) return;



        const input =
        document.querySelector(
            ".search-input"
        );



        if(!input) return;



        const query =
        input.value.trim();




        loadPage(

            `/panel/shipments/?q=${encodeURIComponent(query)}`

        );

    }

);




// =====================================
// ENTER SEARCH
// =====================================

document.addEventListener(

    "keydown",

    function(e){

        if(

            e.key === "Enter"

            &&

            document.activeElement.classList.contains(
                "search-input"
            )

        ){

            e.preventDefault();




            const input =
            document.querySelector(
                ".search-input"
            );



            const query =
            input.value.trim();




            loadPage(

                `/panel/shipments/?q=${encodeURIComponent(query)}`

            );

        }

    }

);

//


