lucide.createIcons();


const ctx = document.getElementById('shipmentChart').getContext('2d');

// 🎨 Gradient background
const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, 'rgba(249, 115, 22, 0.3)');
gradient.addColorStop(1, 'rgba(249, 115, 22, 0)');

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            data: [10, 15, 22, 18, 30, 42],

            borderColor: '#f97316',
            backgroundColor: gradient,

            fill: true,
            tension: 0.4,

            // 🔥 dots sèlman lè hover
            pointRadius: 0,
            pointHoverRadius: 6,
            pointBackgroundColor: '#f97316',
            pointHoverBorderWidth: 2,
            pointHoverBorderColor: '#fff',
        }]
    },
    options: {
        responsive: true,

        // ⚡ animation smooth
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

            // 🔥 tooltip style
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




