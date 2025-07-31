// Menjalankan semua kode HANYA SETELAH seluruh halaman HTML selesai dimuat.
// Ini adalah cara paling aman dan benar.
document.addEventListener('DOMContentLoaded', function() {
    

    // === GLOBAL CART LOGIC ===
    const cartCounter = document.getElementById('cart-counter');
    const emptyCartButton = document.getElementById('empty-cart-btn');

    // Ambil item dari localStorage, jika tidak ada, inisialisasi array kosong
    let cartItems = JSON.parse(localStorage.getItem('wearpickCartItems')) || [];

    // Fungsi untuk memperbarui tampilan counter di header
    function updateCartCounter() {
        if (cartItems.length > 0) {
            cartCounter.textContent = cartItems.length; // Hitung jumlah item unik, bukan total kuantitas
            cartCounter.classList.remove('hidden');
        } else {
            cartCounter.classList.add('hidden');
        }
    }

    // Panggil fungsi ini saat halaman dimuat untuk menampilkan jumlah awal
    updateCartCounter();

    // LOGIKA: Saat tombol "Kosongkan" di-klik
    if (emptyCartButton) {
        emptyCartButton.addEventListener('click', function() {
            if (confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
                cartItems = []; // Kosongkan array item
                localStorage.removeItem('wearpickCartItems'); // Hapus dari localStorage
                updateCartCounter(); // Perbarui tampilan counter

                // Jika di halaman keranjang, perbarui tampilannya juga
                if (document.body.classList.contains('keranjang-page')) {
                    loadCartPage();
                }
                alert('Keranjang telah dikosongkan!');
            }
        });
    }

    // === BAGIAN 1: LOGIKA UMUM (BERJALAN DI SEMUA HALAMAN) ===

    // Menetapkan tahun saat ini secara otomatis di footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Menangani submit pada form konsultasi (hanya berjalan jika ada form-nya)
    const formKonsultasi = document.getElementById('form-konsultasi');
    if (formKonsultasi) {
        const pesanSukses = document.getElementById('pesan-sukses');
        formKonsultasi.addEventListener('submit', function(event) {
            event.preventDefault();
            const namaPengguna = document.getElementById('nama').value;
            formKonsultasi.style.display = 'none';
            pesanSukses.innerHTML = `
                <h2>Terima Kasih, ${namaPengguna}!</h2>
                <p>Rekomendasi gaya Anda sedang kami siapkan. Tim kami akan segera menghubungi Anda melalui email.</p>
            `;
            pesanSukses.style.display = 'block';
        });
    }

    // === BAGIAN 2: LOGIKA KHUSUS Halaman WEARPICKER ===

    // Ambil semua elemen yang dibutuhkan untuk WearPicker
    const genderButtons = document.querySelectorAll('.gender-btn');
    const themeSelector = document.getElementById('theme-selector');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const wardrobeContainer = document.getElementById('wearpicker-container');
    const allItems = document.querySelectorAll('.item-thumbnail');
    const showcaseContainer = document.getElementById('selected-items-showcase');

    // Cek apakah kita berada di halaman WearPicker sebelum menjalankan kodenya
    if (genderButtons.length > 0 && wardrobeContainer) {
        let selectedGender = '';
        let selectedTheme = '';

        // 2a. LOGIKA SAAT TOMBOL GENDER DI-KLIK
        genderButtons.forEach(button => {
            button.addEventListener('click', function() {
                selectedGender = button.dataset.gender;
                themeSelector.style.display = 'flex'; // Diubah menjadi flex agar tombol sejajar
                wardrobeContainer.style.display = 'none';
                showcaseContainer.innerHTML = '';
                themeButtons.forEach(btn => btn.classList.remove('active'));
                genderButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });

        // 2b. LOGIKA SAAT TOMBOL TEMA DI-KLIK
        themeButtons.forEach(button => {
            button.addEventListener('click', function() {
                wardrobeContainer.style.display = 'flex'; // Diubah menjadi flex untuk layout 2 kolom
                selectedTheme = button.dataset.theme;
                themeButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                allItems.forEach(item => {
                    const itemGender = item.dataset.gender;
                    const itemThemes = item.dataset.theme;
                    if (itemGender.includes(selectedGender) && itemThemes.includes(selectedTheme)) {
                        item.style.display = 'inline-block';
                    } else {
                        item.style.display = 'none';
                    }
                });
                showcaseContainer.innerHTML = '';
            });
        });

        // 2c. LOGIKA SAAT THUMBNAIL PAKAIAN DI-KLIK
        allItems.forEach(thumb => {
            thumb.addEventListener('click', function() {
                const category = thumb.dataset.category;
                const imageSrc = thumb.dataset.image;
                const altText = thumb.alt;

                let categoryBox = document.getElementById(`showcase-${category}`);

                if (categoryBox) {
                    categoryBox.querySelector('img').src = imageSrc;
                    categoryBox.querySelector('img').alt = altText;
                } else {
                    categoryBox = document.createElement('div');
                    categoryBox.id = `showcase-${category}`;
                    categoryBox.className = 'selected-item-box';

                    const newImage = document.createElement('img');
                    newImage.src = imageSrc;
                    newImage.alt = altText;

                    const newTitle = document.createElement('p');
                    newTitle.textContent = category;

                    categoryBox.appendChild(newImage);
                    categoryBox.appendChild(newTitle);
                    showcaseContainer.appendChild(categoryBox);
                }
            });
        });
    }

    // === BAGIAN 3: LOGIKA KHUSUS Halaman DETAIL PRODUK ===
    const addToCartButton = document.querySelector('.btn-add-to-cart');
    if (addToCartButton) {
        const notificationArea = document.getElementById('add-to-cart-notification');
        const productTitleEl = document.querySelector('.product-info-detail h1');
        const productPriceEl = document.querySelector('.price-detail');
        const productImageEl = document.querySelector('.product-image-detail img');

        addToCartButton.addEventListener('click', function() {
            // Pastikan ada data-product-id di tombol Tambah ke Keranjang
            const productId = this.dataset.productId || 'unique-product-id-' + Math.random().toString(36).substr(2, 9);
            const productName = productTitleEl ? productTitleEl.textContent : 'Produk Tidak Dikenal';
            const productPriceText = productPriceEl ? productPriceEl.textContent : 'Rp 0';
            // Menghilangkan 'Rp ' dan '.' untuk konversi ke angka
            const productPrice = parseFloat(productPriceText.replace('Rp ', '').replace(/\./g, ''));
            const productImage = productImageEl ? productImageEl.src : 'images/placeholder.jpg';

            // Cek apakah item sudah ada di keranjang
            const existingItemIndex = cartItems.findIndex(item => item.id === productId);

            if (existingItemIndex > -1) {
                cartItems[existingItemIndex].quantity += 1; // Tingkatkan kuantitas
            } else {
                const newItem = {
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                };
                cartItems.push(newItem);
            }

            localStorage.setItem('wearpickCartItems', JSON.stringify(cartItems));
            updateCartCounter();

            notificationArea.textContent = `✓ ${productName} berhasil ditambahkan!`;
            notificationArea.style.display = 'block';
            setTimeout(function() {
                notificationArea.style.display = 'none';
            }, 3000);
        });
    }

    // === BAGIAN 4: LOGIKA KHUSUS Halaman KERANJANG (keranjang.html) ===
    function loadCartPage() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalElement = document.getElementById('cart-total');
        const checkoutButton = document.getElementById('checkout-button');

        if (!cartItemsContainer) return; // Keluar jika tidak di halaman keranjang

        cartItemsContainer.innerHTML = ''; // Hapus item sebelumnya
        let total = 0;

        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = '<p>Keranjang Anda kosong.</p>';
            if (checkoutButton) checkoutButton.classList.add('disabled');
        } else {
            if (checkoutButton) checkoutButton.classList.remove('disabled');
            cartItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('cart-item');
                itemElement.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Jumlah: ${item.quantity}</p>
                        <p class="price">Rp ${item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <button class="remove-item-btn" data-id="${item.id}">Hapus</button>
                `;
                cartItemsContainer.appendChild(itemElement);
                total += item.price * item.quantity;
            });
        }

        cartTotalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;

        // Tambahkan event listener untuk tombol hapus
        document.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', function() {
                const itemIdToRemove = this.dataset.id;
                cartItems = cartItems.filter(item => item.id !== itemIdToRemove);
                localStorage.setItem('wearpickCartItems', JSON.stringify(cartItems));
                updateCartCounter();
                loadCartPage(); // Muat ulang halaman keranjang untuk menampilkan perubahan
            });
        });
    }

    // Panggil loadCartPage jika berada di halaman keranjang
    if (document.getElementById('cart-items')) {
        document.body.classList.add('keranjang-page'); // Tambahkan kelas ke body untuk styling/logika spesifik
        loadCartPage();
    }


    // === BAGIAN 5: LOGIKA KHUSUS Halaman PEMBAYARAN (pembayaran.html) ===
    function loadCheckoutPage() {
        const orderSummaryItems = document.getElementById('order-summary-items');
        const checkoutTotalElement = document.getElementById('checkout-total');
        const checkoutForm = document.getElementById('checkout-form');

        if (!orderSummaryItems) return; // Keluar jika tidak di halaman pembayaran

        orderSummaryItems.innerHTML = ''; // Hapus item sebelumnya
        let total = 0;

        if (cartItems.length === 0) {
            orderSummaryItems.innerHTML = '<p>Keranjang Anda kosong. Silakan belanja terlebih dahulu.</p>';
            if (checkoutForm) checkoutForm.querySelector('button[type="submit"]').disabled = true; // Nonaktifkan tombol submit
        } else {
             if (checkoutForm) checkoutForm.querySelector('button[type="submit"]').disabled = false;
            cartItems.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('summary-item');
                itemElement.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                `;
                orderSummaryItems.appendChild(itemElement);
                total += item.price * item.quantity;
            });
        }

        checkoutTotalElement.textContent = `Rp ${total.toLocaleString('id-ID')}`;

        // Menangani pengiriman form pembayaran (placeholder)
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', function(event) {
                event.preventDefault();
                if (cartItems.length === 0) {
                    alert('Keranjang Anda kosong. Tidak dapat melanjutkan pembayaran.');
                    return;
                }
                alert('Pesanan Anda berhasil dikirim! (Ini adalah simulasi. Data tidak benar-benar dikirim.)');
                // Di sini Anda biasanya akan mengirim data ke server
                // Setelah pesanan berhasil, kosongkan keranjang
                cartItems = [];
                localStorage.removeItem('wearpickCartItems');
                updateCartCounter();
                // Redirect ke halaman terima kasih atau halaman beranda
                window.location.href = 'index.html'; // Contoh redirect
            });
        }
    }

    // Panggil loadCheckoutPage jika berada di halaman pembayaran
    if (document.getElementById('checkout-form')) {
        document.body.classList.add('pembayaran-page'); // Tambahkan kelas ke body
        loadCheckoutPage();
    }

}); // Akhir DOMContentLoaded