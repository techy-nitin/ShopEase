# ShopEase

ShopEase is a full-stack e-commerce web application built using React, Java Spring Boot, and PostgreSQL. It provides an online shopping experience with product browsing, cart management, wishlists, order tracking, and seller inventory management.

## 🚀 Live Demo

**[Click here to visit ShopEase](https://techy-nitin.github.io/ShopEase/#/login)**

## ✨ Features

### Shopping
- Interactive home page with promotional banners, categories, deals, and bank offers.
- Browse products with keyword search and category filtering.
- View product details, images, ratings, and reviews.
- Add products to the cart and manage quantities.
- Add products to the wishlist and move items between the cart and wishlist.

### User Account
- User registration and login.
- Profile management and account deletion.
- Checkout and order placement.
- Order history, cancellation, and buy-again functionality.
- Product reviews and invoice PDF downloads.
- Return and refund requests.

### Seller Dashboard
- Seller registration with email OTP verification.
- Add, update, and delete products.
- Manage product inventory.
- View dashboard statistics and order summaries.
- Export seller data to CSV.

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, React Router, Tailwind CSS
- **UI Libraries:** Swiper, Framer Motion, Lucide
- **Backend:** Java 17, Spring Boot 3.3.5
- **Database:** PostgreSQL
- **Security:** Spring Security, JWT, BCrypt
- **Other Tools:** Maven, Spring Data JPA, Spring Mail, iText PDF
- **Deployment:** GitHub Pages, GitHub Actions

## 📂 Project Structure

```text
ShopEase/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── ShopEase/          # React frontend
│   ├── src/
│   └── package.json
└── ShopEase_Back/     # Spring Boot backend
    ├── src/
    └── pom.xml
```

## 💻 Run Locally

### Frontend

```bash
cd ShopEase
npm install
npm run dev
```

### Backend

Make sure Java 17, Maven, and PostgreSQL are installed and configured.

```bash
cd ShopEase_Back
mvn spring-boot:run
```

## 🚀 Deployment

The frontend is deployed using GitHub Pages, with GitHub Actions configured to build and publish the application.

**Live Website:** [ShopEase](https://techy-nitin.github.io/ShopEase/#/login)

---

Built with ❤️ using React, Spring Boot, and PostgreSQL.
