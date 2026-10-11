
document.addEventListener("DOMContentLoaded", () => {
    const CART_KEY = "godwinFoodHomeCart";
    const WHATSAPP_NUMBER = "2349126178626";

    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.getElementById("nav");

    const cartCount = document.getElementById("cart-count");
    const cartItemsContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total");
    const summaryQuantity = document.getElementById("summary-quantity");

    const clearCartButton = document.getElementById("clear-cart");
    const checkoutButton = document.getElementById("checkout-button");

    const yearElement = document.getElementById("year");

    let cart = loadCart();

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }

    function loadCart() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(CART_KEY) || "[]"
            );

            if (!Array.isArray(saved)) return [];

            return saved.filter(item =>
                item &&
                typeof item.name === "string" &&
                Number.isFinite(item.price) &&
                item.price > 0 &&
                Number.isSafeInteger(item.quantity) &&
                item.quantity > 0
            );
        } catch {
            return [];
        }
    }

    function saveCart() {
        try {
            localStorage.setItem(CART_KEY, JSON.stringify(cart));
        } catch {
            alert("Your browser could not save the cart.");
        }
    }

    function formatNaira(amount) {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }).format(amount);
    }

    // MOBILE NAVIGATION
    if (menuToggle && nav) {
        menuToggle.addEventListener("click", () => {
            const isOpen = nav.classList.toggle("open");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                nav.classList.remove("open");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // ADD PRODUCTS ON THE MENU PAGE
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => {
            const name = button.dataset.name;
            const price = Number(button.dataset.price);

            if (!name || !Number.isSafeInteger(price) || price <= 0) {
                alert("This food item has invalid details.");
                return;
            }

            const existing = cart.find(item => item.name === name);

            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({
                    name,
                    price,
                    quantity: 1
                });
            }

            saveCart();
            renderCart();

            const originalText = button.textContent;
            button.textContent = "Added ✓";

            window.setTimeout(() => {
                button.textContent = originalText;
            }, 900);
        });
    });

    function changeQuantity(name, change) {
        const item = cart.find(product => product.name === name);

        if (!item) return;

        item.quantity += change;

        if (item.quantity <= 0) {
            cart = cart.filter(product => product.name !== name);
        }

        saveCart();
        renderCart();
    }

    function renderCart() {
        const totalQuantity = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalPrice = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        if (cartCount) {
            cartCount.textContent = totalQuantity;
        }

        if (cartTotalElement) {
            cartTotalElement.textContent = formatNaira(totalPrice);
        }

        if (summaryQuantity) {
            summaryQuantity.textContent = totalQuantity;
        }

        if (cartItemsContainer) {
            cartItemsContainer.replaceChildren();

            if (cart.length === 0) {
                const empty = document.createElement("div");
                empty.className = "empty-cart";

                const message = document.createElement("p");
                message.textContent = "Your cart is empty.";

                const link = document.createElement("a");
                link.href = "index.html#products";
                link.className = "btn";
                link.textContent = "Explore Our Menu";

                empty.append(message, link);
                cartItemsContainer.appendChild(empty);
            } else {
                cart.forEach(item => {
                    const row = document.createElement("div");
                    row.className = "cart-item";

                    const details = document.createElement("div");

                    const title = document.createElement("h4");
                    title.textContent = item.name;

                    const price = document.createElement("p");
                    price.className = "cart-item-price";
                    price.textContent =
                        `${formatNaira(item.price)} each · ` +
                        `${formatNaira(item.price * item.quantity)} total`;

                    const actions = document.createElement("div");
                    actions.className = "cart-item-actions";

                    const decrease = document.createElement("button");
                    decrease.type = "button";
                    decrease.className = "quantity-button";
                    decrease.textContent = "−";
                    decrease.setAttribute(
                        "aria-label",
                        `Remove one ${item.name}`
                    );
                    decrease.addEventListener("click", () => {
                        changeQuantity(item.name, -1);
                    });

                    const quantity = document.createElement("span");
                    quantity.textContent = item.quantity;

                    const increase = document.createElement("button");
                    increase.type = "button";
                    increase.className = "quantity-button";
                    increase.textContent = "+";
                    increase.setAttribute(
                        "aria-label",
                        `Add one ${item.name}`
                    );
                    increase.addEventListener("click", () => {
                        changeQuantity(item.name, 1);
                    });

                    const remove = document.createElement("button");
                    remove.type = "button";
                    remove.className = "remove-item";
                    remove.textContent = "Remove";
                    remove.addEventListener("click", () => {
                        cart = cart.filter(
                            product => product.name !== item.name
                        );

                        saveCart();
                        renderCart();
                    });

                    actions.append(decrease, quantity, increase, remove);
                    details.append(title, price, actions);
                    row.appendChild(details);

                    cartItemsContainer.appendChild(row);
                });
            }
        }

        if (clearCartButton) {
            clearCartButton.disabled = cart.length === 0;
        }

        if (checkoutButton) {
            checkoutButton.disabled = cart.length === 0;
        }
    }

    if (clearCartButton) {
        clearCartButton.addEventListener("click", () => {
            cart = [];
            saveCart();
            renderCart();
        });
    }

    // WHATSAPP CHECKOUT
    if (checkoutButton) {
        checkoutButton.addEventListener("click", () => {
            if (cart.length === 0) {
                alert("Please add meals to your cart first.");
                return;
            }

            const total = cart.reduce(
                (sum, item) => sum + item.price * item.quantity,
                0
            );

            const lines = cart.map(item =>
                `- ${item.name} x${item.quantity}: ` +
                formatNaira(item.price * item.quantity)
            );

            const message = [
                "Hello Godwin Food Home! I would like to order:",
                "",
                ...lines,
                "",
                `Total: ${formatNaira(total)}`,
                "",
                "Please confirm availability and delivery details."
            ].join("\n");

            const url =
                `https://wa.me/${WHATSAPP_NUMBER}?text=` +
                encodeURIComponent(message);

            window.open(url, "_blank", "noopener,noreferrer");
        });
    }

    renderCart();
});
