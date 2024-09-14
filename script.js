document.addEventListener('DOMContentLoaded', function () {
    const cartItems = [];

    // Function to add items to the cart
    function addToCart(productName, productPrice, productImage) {
        const item = {
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        };

        // Check if item already exists in the cart
        const existingItem = cartItems.find(i => i.name === item.name);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cartItems.push(item);
        }

        updateCartDisplay();
        alert(`${productName} has been added to the cart!`);
    }

    // Function to update cart display
    function updateCartDisplay() {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }


    // Event listeners for all add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function () {
            const product = this.closest('.instrument');
            const name = product.querySelector('h3').textContent;
            const price = parseFloat(product.querySelector('.price').textContent.replace('₹', ''));
            const image = product.querySelector('img').src;

            addToCart(name, price, image);
        });
    });

    // Review Form Submission
    document.querySelectorAll('.review-form form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const reviewContainer = this.nextElementSibling;
            const reviewerName = this.querySelector('input[type="text"]').value;
            const reviewContent = this.querySelector('textarea').value;
            const reviewHtml = `<p><strong>${reviewerName}</strong>: ${reviewContent}</p>`;
            reviewContainer.innerHTML += reviewHtml;
            this.reset(); // Clear the form after submission
        });
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSubtotalElem = document.getElementById('cart-subtotal');
    const cartTotalElem = document.getElementById('cart-total');

    // Function to update cart display
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        let subtotal = 0;

        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${item.image}" alt="${item.name}" width="50"></td>
                <td>${item.name}</td>
                <td>₹${item.price.toFixed(2)}</td>
                <td>
                    <input type="number" value="${item.quantity}" min="1" data-index="${index}" class="item-quantity">
                </td>
                <td>₹${itemTotal.toFixed(2)}</td>
                <td><button class="remove-btn" data-index="${index}">Remove</button></td>
            `;
            cartItemsContainer.appendChild(row);
        });

        cartSubtotalElem.textContent = subtotal.toFixed(2);
        cartTotalElem.textContent = subtotal.toFixed(2); // Update total (including shipping if any)
    }

    // Function to remove item from cart
    function removeItemFromCart(index) {
        cartItems.splice(index, 1);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartDisplay();
        alert('Item removed from cart!');
    }

    // Function to update item quantity
    function updateItemQuantity(index, newQuantity) {
        cartItems[index].quantity = newQuantity;
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        updateCartDisplay();
        alert('Item quantity updated!');
    }

    // Event listener for removing items
    cartItemsContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-btn')) {
            const index = e.target.getAttribute('data-index');
            removeItemFromCart(index);
        }
    });

    // Event listener for changing item quantities
    cartItemsContainer.addEventListener('input', function (e) {
        if (e.target.classList.contains('item-quantity')) {
            const index = e.target.getAttribute('data-index');
            const newQuantity = parseInt(e.target.value);
            if (newQuantity > 0) {
                updateItemQuantity(index, newQuantity);
            }
        }
    });

    // script.js

function displayPaymentMethods() {
    // Hide cart summary and reviews section
    document.querySelector('.cart-summary').style.display = 'none';
    document.querySelector('.reviews-section').style.display = 'none';

    // Show payment methods section
    document.getElementById('payment-methods').style.display = 'block';
}

function payNow() {
    // This function can be expanded to handle the actual payment processing logic
    alert('Proceeding with payment...');
}



    // Load reviews from local storage
    function loadReviews() {
        cartItems.forEach(item => {
            if (item.reviews && item.reviews.length > 0) {
                const productReviews = document.createElement('div');
                productReviews.className = 'product-reviews';
                productReviews.innerHTML = `<h3>Reviews for ${item.name}</h3>`;

                item.reviews.forEach(review => {
                    const reviewElem = document.createElement('p');
                    reviewElem.innerHTML = `<strong>${review.name}:</strong> ${review.content}`;
                    productReviews.appendChild(reviewElem);
                });

                reviewsContainer.appendChild(productReviews);
            }
        });
    }

    // Initialize cart and reviews display
    updateCartDisplay();
    loadReviews();
});

document.addEventListener('DOMContentLoaded', () => {
    const buyNowButtons = document.querySelectorAll('.buy-now');

    buyNowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-product-id');
            // Redirect to the checkout page with the product ID as a query parameter
            window.location.href = `checkout.html?product_id=${productId}`;
            alert('Redirecting to checkout page...');
        });
    });

    const playVideoButtons = document.querySelectorAll('.play-video');

    playVideoButtons.forEach(button => {
        button.addEventListener('click', () => {
            const videoUrl = button.getAttribute('data-video-url');
            window.open(videoUrl, '_blank');
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payment-form');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const {paymentMethod, error} = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });

        if (error) {
            errorMessage.textContent = error.message;
        } else {
            // Send the paymentMethod.id to your server to create the payment intent
            fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({paymentMethodId: paymentMethod.id}),
            }).then(response => response.json()).then(({clientSecret}) => {
                stripe.confirmCardPayment(clientSecret).then(({paymentIntent, error}) => {
                    if (error) {
                        errorMessage.textContent = error.message;
                    } else {
                        if (paymentIntent.status === 'succeeded') {
                            alert('Payment successful!');
                            window.location.href = '/order-confirmation'; // Redirect to confirmation page
                        }
                    }
                });
            });
        }
    });
});

//check ou//
document.addEventListener('DOMContentLoaded', function () {
    const proceedButton = document.getElementById('proceed-to-checkout');

    if (proceedButton) {
        proceedButton.addEventListener('click', function () {
            alert('Proceeding to checkout...');
            // You can add code here to redirect to the checkout page if needed
            window.location.href = 'checkout.html'; // Example redirect
        });
    }
});


document.addEventListener("DOMContentLoaded", function () {
    // Handle "Buy Now" button clicks
    const buyNowButtons = document.querySelectorAll(".buy-now");

    buyNowButtons.forEach(button => {
        button.addEventListener("click", function () {
            const productData = JSON.parse(this.getAttribute("data-product"));
            localStorage.setItem("selectedProduct", JSON.stringify(productData));
            window.location.href = "buynow.html";  // Redirect to the "Buy Now" page
        });
    });

    // Load selected product details on "Buy Now" page
    const productData = JSON.parse(localStorage.getItem("selectedProduct"));
    if (productData) {
        document.getElementById("product-name").textContent = productData.name;
        document.getElementById("product-price").textContent = productData.price;
        document.getElementById("product-description").textContent = productData.description;
        document.getElementById("product-image").src = productData.image;
        document.getElementById("product-image").alt = productData.name;
    }
});


//SORTING PAGE//
document.addEventListener("DOMContentLoaded", function () {
    const sortOptions = document.getElementById("sort-options");
    const instrumentsContainer = document.querySelector(".musical-instruments");

    sortOptions.addEventListener("change", function () {
        const option = this.value;
        const instruments = Array.from(instrumentsContainer.getElementsByClassName("instrument"));

        let sortedInstruments;
        if (option === "name") {
            sortedInstruments = instruments.sort((a, b) => {
                const nameA = a.querySelector("h3").textContent.toLowerCase();
                const nameB = b.querySelector("h3").textContent.toLowerCase();
                return nameA.localeCompare(nameB);
            });
        } else if (option === "price-asc") {
            sortedInstruments = instruments.sort((a, b) => {
                const priceA = parseFloat(a.querySelector(".price").textContent.replace("₹", ""));
                const priceB = parseFloat(b.querySelector(".price").textContent.replace("₹", ""));
                return priceA - priceB;
            });
        } else if (option === "price-desc") {
            sortedInstruments = instruments.sort((a, b) => {
                const priceA = parseFloat(a.querySelector(".price").textContent.replace("₹", ""));
                const priceB = parseFloat(b.querySelector(".price").textContent.replace("₹", ""));
                return priceB - priceA;
            });
        } else {
            sortedInstruments = instruments;
        }

        // Clear the container and append sorted instruments
        instrumentsContainer.innerHTML = "";
        sortedInstruments.forEach(instrument => instrumentsContainer.appendChild(instrument));
    });
});



//payment method//
document.addEventListener("DOMContentLoaded", function() {
    const buyNowButtons = document.querySelectorAll(".buy-now");
    const modal = document.getElementById("payment-modal");
    const closeButton = document.querySelector(".close-button");
    const buyNowSection = document.getElementById("buy-now-section");
    const productImage = document.getElementById("product-image");
    const productName = document.getElementById("product-name");
    const productPrice = document.getElementById("product-price");
    const productDescription = document.getElementById("product-description");
    const paymentOption = document.getElementById("payment-option");
    const paymentDetails = document.querySelectorAll(".payment-details");

    // Function to open modal
    function openModal() {
        modal.style.display = "block";
    }

    // Function to close modal
    function closeModal() {
        modal.style.display = "none";
    }

    // Event listeners for buy now buttons
    buyNowButtons.forEach(button => {
        button.addEventListener("click", function() {
            const productData = JSON.parse(this.getAttribute('data-product'));

            // Display product details in the 'Buy Now' section
            productImage.src = productData.image;
            productName.textContent = productData.name;
            productPrice.textContent = productData.price;
            productDescription.textContent = productData.description;

            // Show the 'Buy Now' section
            buyNowSection.style.display = "block";
        });
    });

    // Event listener for payment option selection
    paymentOption.addEventListener("change", function() {
        // Hide all payment details sections
        paymentDetails.forEach(detail => detail.style.display = "none");

        // Show the selected payment details section
        if (this.value === "card") {
            document.getElementById("card-details").style.display = "block";
        } else if (this.value === "phonepe") {
            document.getElementById("phonepe-details").style.display = "block";
        } else if (this.value === "cod") {
            document.getElementById("cod-details").style.display = "block";
        }
    });

    // Event listener for close button
    closeButton.addEventListener("click", closeModal);

    // Event listener to close modal when clicking outside the modal content
    window.addEventListener("click", function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Event listener for form submission (fake submission handler for demo purposes)
    document.getElementById("payment-form").addEventListener("submit", function(event) {
        event.preventDefault(); // Prevent actual form submission

        // For demo purposes, just open the modal
        openModal();
    });
});


//order tracking//
document.addEventListener("DOMContentLoaded", function () {
    const paymentForm = document.getElementById('payment-form');
    const paymentOption = document.getElementById('payment-option');
    const cardDetails = document.getElementById('card-details');
    const phonepeDetails = document.getElementById('phonepe-details');
    const codDetails = document.getElementById('cod-details');
    const paymentModal = document.getElementById('payment-modal');
    const closeButton = document.querySelector('.close-button');

    // Order tracking elements
    const orderIdElement = document.getElementById('order-id');
    const estimatedDeliveryElement = document.getElementById('estimated-delivery');
    const trackingStatusElement = document.getElementById('tracking-status');
    const shippingAddressElement = document.getElementById('shipping-address');

    // Event listener to show relevant payment details based on selection
    paymentOption.addEventListener('change', function () {
        cardDetails.style.display = 'none';
        phonepeDetails.style.display = 'none';
        codDetails.style.display = 'none';
        
        if (paymentOption.value === 'card') {
            cardDetails.style.display = 'block';
        } else if (paymentOption.value === 'phonepe') {
            phonepeDetails.style.display = 'block';
        } else if (paymentOption.value === 'cod') {
            codDetails.style.display = 'block';
        }
    });

    // Event listener for the payment form submission
    paymentForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent actual form submission
        showPaymentSuccess();   // Show payment success modal
    });

    // Function to display the payment success modal and populate order details
    function showPaymentSuccess() {
        // Dummy order data - replace with actual data as needed
        const orderData = {
            orderId: "123456789",
            estimatedDelivery: "5-7 business days",
            trackingStatus: "Processing",
            shippingAddress: "123 Main St, Anytown, USA"
        };

        // Populate order tracking details in the modal
        orderIdElement.textContent = orderData.orderId;
        estimatedDeliveryElement.textContent = orderData.estimatedDelivery;
        trackingStatusElement.textContent = orderData.trackingStatus;
        shippingAddressElement.textContent = orderData.shippingAddress;

        // Display the modal
        paymentModal.style.display = 'block';
    }

    // Close modal when the close button is clicked
    closeButton.addEventListener('click', function () {
        paymentModal.style.display = 'none';
    });

    // Close modal when clicking outside the modal content
    window.addEventListener('click', function (event) {
        if (event.target === paymentModal) {
            paymentModal.style.display = 'none';
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    // Other existing code...

    // Handle payment form submission and order tracking
    const form = document.getElementById('payment-form');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const {paymentMethod, error} = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });

        if (error) {
            errorMessage.textContent = error.message;
        } else {
            fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({paymentMethodId: paymentMethod.id}),
            }).then(response => response.json()).then(({clientSecret}) => {
                stripe.confirmCardPayment(clientSecret).then(({paymentIntent, error}) => {
                    if (error) {
                        errorMessage.textContent = error.message;
                    } else {
                        if (paymentIntent.status === 'succeeded') {
                            alert('Payment successful!');
                            displayOrderTrackingDetails();
                            window.location.href = '/order-confirmation'; // Redirect to confirmation page
                        }
                    }
                });
            });
        }
    });

    function displayOrderTrackingDetails() {
        // Example of generating order tracking details
        const orderId = `ORD-${Math.floor(Math.random() * 1000000)}`;  // Mock order ID
        const estimatedDelivery = "5-7 business days";  // Example delivery estimate
        const trackingStatus = "Processing";  // Initial status
        const shippingAddress = "123 Music Ave, Music City, USA";  // Example shipping address

        // Display the order tracking details in the modal
        document.getElementById('order-id').textContent = orderId;
        document.getElementById('estimated-delivery').textContent = estimatedDelivery;
        document.getElementById('tracking-status').textContent = trackingStatus;
        document.getElementById('shipping-address').textContent = shippingAddress;

        // Show the modal
        document.getElementById('payment-modal').style.display = 'block';
    }
});


// script.js
// Function to display payment methods
function displayPaymentMethods() {
    // Show the payment methods section
    document.getElementById('payment-methods').style.display = 'block';
}

// Function to toggle payment details visibility based on selected payment method
function togglePaymentDetails(method) {
    // Hide all payment details sections initially
    document.getElementById('card-details').style.display = 'none';
    document.getElementById('phonepe-details').style.display = 'none';
    document.getElementById('qr-scanner').style.display = 'none';

    // Show the relevant section based on the selected payment method
    if (method === 'Card') {
        document.getElementById('card-details').style.display = 'block';
    } else if (method === 'PhonePe') {
        document.getElementById('phonepe-details').style.display = 'block';
        document.getElementById('qr-scanner').style.display = 'block'; // Show QR scanner for PhonePe
    } else if (method === 'COD') {
        // No additional details needed for COD
    }
}

// Function to handle payment process based on selected method
function payNow() {
    const selectedMethod = document.querySelector('input[name="payment-method"]:checked').value;

    switch (selectedMethod) {
        case 'COD':
            alert('You have selected Cash on Delivery.');
            break;
        case 'PhonePe':
            alert('Please scan the QR code with your PhonePe app to complete the payment.');
            break;
        case 'Card':
            alert('Please enter your card details to proceed.');
            break;
        default:
            alert('Please select a payment method.');
    }

    // Proceed to show the order details and tracking
    document.getElementById('order-details').style.display = 'block';
    document.getElementById('order-tracking').style.display = 'block';
}




// script.js

document.addEventListener('DOMContentLoaded', () => {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const buyNowButtons = document.querySelectorAll('.buy-now');

    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            alert('Item added to cart!');
            // Logic to add the item to the cart (e.g., local storage or backend integration)
        });
    });

    buyNowButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const productId = event.target.getAttribute('data-product-id');
            window.location.href = `buy-now.html?product_id=${productId}`;
        });
    });
});
