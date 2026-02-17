# Маппинг Firebase -> Backend API

Этот документ фиксирует, как текущие места во Flutter, которые используют Firebase/Firestore, переводятся на REST API.

## Авторизация

- Flutter: `FirebaseAuth.signInWithEmailAndPassword`
- Backend: `POST /api/v1/auth/login`
- Flutter: `FirebaseAuth.createUserWithEmailAndPassword` + `users/{uid}` в Firestore
- Backend: `POST /api/v1/auth/register`
- Flutter: `FirebaseAuth.authStateChanges()`
- Backend: хранение `accessToken` на клиенте и проверка через `GET /api/v1/users/me`

## Профиль

- Flutter: `users/{uid}` (Firestore) чтение/обновление
- Backend: `GET /api/v1/users/me`, `PATCH /api/v1/users/me`

## Каталог / товары

- Flutter: статический `allProducts` в `home_page.dart`
- Backend: `GET /api/v1/products`, `GET /api/v1/products/:id`, `GET /api/v1/categories`

## Корзина

- Flutter: `users/{uid}/cart` (Firestore)
- Backend: `GET /api/v1/cart`
- Backend: `POST /api/v1/cart/items` (добавить)
- Backend: `PATCH /api/v1/cart/items/:id` (изменить)
- Backend: `DELETE /api/v1/cart/items/:id` (удалить)

## Оформление заказа

- Flutter: запись заказа в `orders/{orderId}` и `users/{uid}/orders/{orderId}`
- Backend: `POST /api/v1/orders/checkout` (создание заказа из корзины + очистка корзины)
- Backend: `GET /api/v1/orders/my` (список)
- Backend: `GET /api/v1/orders/:id` (детали)

## Филиалы

- Flutter: статическая заглушка в `shops_page.dart`
- Backend: `GET /api/v1/shops`

## Поддержка

- Flutter: `support_chats/{uid}/messages` (Firestore)
- Backend: `GET /api/v1/support/thread`
- Backend: `GET /api/v1/support/messages`
- Backend: `POST /api/v1/support/messages`
