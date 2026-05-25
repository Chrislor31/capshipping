lucide.createIcons();



const shipmentLabels = window.shipmentLabels;

const shipmentData = window.shipmentData;


const ctx = document.getElementById('shipmentChart').getContext('2d');


// 🔥 GRADIENT
const gradient = ctx.createLinearGradient(0, 0, 0, 300);

gradient.addColorStop(0, 'rgba(249, 115, 22, 0.35)');
gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');


// 🔥 CHART
new Chart(ctx, {

    type: 'line',

    data: {

        labels: shipmentLabels,

        datasets: [{

            data: shipmentData,

            borderColor: '#f97316',

            backgroundColor: gradient,

            fill: true,

            tension: 0.4,

            borderWidth: 3,

            pointRadius: 0,

            pointHoverRadius: 6,

            pointBackgroundColor: '#f97316',

            pointHoverBorderWidth: 2,

            pointHoverBorderColor: '#fff',

        }]
    },

    options: {

        responsive: true,

        maintainAspectRatio: false,

        animation: {

            duration: 1200,

            easing: 'easeInOutQuart'

        },

        interaction: {

            mode: 'index',

            intersect: false

        },

        plugins: {

            legend: {

                display: false

            },

            tooltip: {

                backgroundColor: '#111',

                titleColor: '#fff',

                bodyColor: '#fff',

                padding: 10,

                cornerRadius: 6,

                displayColors: false,

                callbacks: {

                    label: function(context) {

                        return " Shipments: " + context.parsed.y;

                    }
                }
            }
        },

        scales: {

            x: {

                grid: {

                    display: false

                }
            },

            y: {

                beginAtZero: true,

                grid: {

                    color: '#eee'

                }
            }
        }
    }
});



const menuItems = document.querySelectorAll('.side_nav li');
const pages = document.querySelectorAll('.page');

menuItems.forEach(item => {
  item.addEventListener('click', () => {

    // 🔥 retire active sou menu
    menuItems.forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    // 🔥 jwenn page
    const pageId = item.getAttribute('data-page');

    // 🔥 kache tout page
    pages.forEach(p => p.classList.remove('active'));

    // 🔥 montre bon page
    document.getElementById(pageId).classList.add('active');

  });
});






// address js

const items = document.querySelectorAll(".add_address_name");

items.forEach(item => {
    item.addEventListener("click", () => {

        // Fèmen lòt yo (optional pro behavior)
        items.forEach(el => {
            if(el !== item){
                el.classList.remove("active");
            }
        });

        // Toggle current
        item.classList.toggle("active");
    });
});




document.querySelectorAll(".copy").forEach(btn => {
    btn.addEventListener("click", () => {

        const container = btn.closest(".details_address");

        const name = container.querySelector("h2").innerText;
        const address = container.querySelector("p").innerText;

        const fullText = name + "\n" + address;

        navigator.clipboard.writeText(fullText)
            .then(() => {
                btn.innerText = "Copied ✅";

                setTimeout(() => {
                    btn.innerHTML = '<span><i data-lucide="copy"></i> Copy address</span>';
                    lucide.createIcons(); // re-render icon
                }, 2000);
            })
            .catch(() => {
                alert("Failed to copy ❌");
            });
    });
});




// PASSWORD CHANGE AJAX (WORKS WITH DYNAMIC DASHBOARD)

document.addEventListener("submit", function(e){

    // verify se form password la
    if(e.target.id === "passwordForm"){

        e.preventDefault(); // 🚫 BLOKE REFRESH

        const form = e.target;
        const message = document.getElementById("message");

        // pran CSRF token
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        const formData = new FormData(form);

        fetch("/change-password/", {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRFToken": csrfToken
            }
        })
        .then(response => response.json())
        .then(data => {

            // afiche mesaj
            message.innerText = data.message;

            if(data.status === "success"){
                message.style.color = "green";
                form.reset(); // vide form lan
            } else {
                message.style.color = "red";
            }

        })
        .catch(error => {
            message.innerText = "Something went wrong";
            message.style.color = "red";
            console.error(error);
        });

    }

});





// =====================================
// UPDATE PROFILE
// =====================================

const updateProfileForm =
document.getElementById(
    "updateProfileForm"
);



if(updateProfileForm){

    updateProfileForm.addEventListener(

        "submit",

        async function(e){

        e.preventDefault();




        const btn =
        document.getElementById(
            "updateProfileBtn"
        );



        btn.disabled = true;



        btn.innerHTML = `

            Updating...

        `;




        const formData =
        new FormData(
            updateProfileForm
        );




        try{

            const response =
            await fetch(

                "/update-profile/",

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




            if(data.status === "success"){

                showAlert(

                    data.message,

                    "success"

                );

            }

            else{

                showAlert(

                    data.message,

                    "error"

                );

            }

        }

        catch(error){

            console.log(error);




            showAlert(

                "Something went wrong",

                "error"

            );

        }

        finally{

            btn.disabled = false;



            btn.innerHTML = `

                Update Information

            `;

        }

    });

}





// calculator user


// =====================================
// USER CALCULATOR
// =====================================

document.addEventListener(

    "click",

    async function(e){

    const btn =
    e.target.closest(
        "#dashCalculateBtn"
    );



    if(!btn) return;




    // =====================================
    // GET VALUES
    // =====================================

    const data = {

        origin:
        document.getElementById(
            "dash_from"
        )?.value,



        destination:
        document.getElementById(
            "dash_to"
        )?.value,



        shipping_type:
        document.getElementById(
            "dash_shipping_type"
        )?.value,



        category:
        document.getElementById(
            "dash_category"
        )?.value,



        weight:
        document.getElementById(
            "dash_weight"
        )?.value,



        quantity:
        document.getElementById(
            "dash_quantity"
        )?.value,



        length:
        document.getElementById(
            "dash_length"
        )?.value,



        width:
        document.getElementById(
            "dash_width"
        )?.value,



        height:
        document.getElementById(
            "dash_height"
        )?.value,

    };




    // =====================================
    // VALIDATION
    // =====================================

    if(

        !data.origin ||

        !data.destination ||

        !data.shipping_type ||

        !data.weight

    ){

        showAlert(

            "Please complete required fields",

            "error"

        );

        return;

    }




    // =====================================
    // LOADING
    // =====================================

    btn.innerHTML = `

        <i class='bx bx-loader-alt bx-spin'></i>

        Calculating...

    `;




    // =====================================
    // FETCH
    // =====================================

    try{

        const response =
        await fetch(

            "/user-calculator/",

            {

                method:"POST",

                headers:{

                    "Content-Type":
                    "application/json",

                    "X-CSRFToken":
                    getCookie(
                        "csrftoken"
                    )

                },

                body:JSON.stringify(
                    data
                )

            }

        );




        const result =
        await response.json();




        // =====================================
        // ERROR
        // =====================================

        if(!result.success){

            showAlert(

                result.error,

                "error"

            );

            return;

        }




        // =====================================
        // UPDATE UI
        // =====================================

        document.getElementById(
            "dash_total"
        ).innerText =

            "$" + result.total;




        document.getElementById(
            "dash_final_total"
        ).innerText =

            "$" + result.total;




        document.getElementById(
            "dash_base_price"
        ).innerText =

            "$" + result.total;




        document.getElementById(
            "dash_delivery"
        ).innerText =

            "Delivery Time: " +

            result.delivery;




        // =====================================
        // SUCCESS
        // =====================================

        showAlert(

            "Price calculated successfully",

            "success"

        );




        // =====================================
        // RESET INPUTS
        // =====================================

        document.getElementById(
            "dash_weight"
        ).value = "";



        document.getElementById(
            "dash_length"
        ).value = "";



        document.getElementById(
            "dash_width"
        ).value = "";



        document.getElementById(
            "dash_height"
        ).value = "";



        document.getElementById(
            "dash_quantity"
        ).value = 1;

    }

    catch(error){

        console.log(error);




        showAlert(

            "Something went wrong",

            "error"

        );

    }

    finally{

        btn.innerHTML = `

            <i class='bx bx-calculator'></i>

            Calculate Price

        `;

    }

});