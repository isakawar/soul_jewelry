from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

# Дані про товари (в реальному проекті це буде база даних)
products = [
    {
        "id": 1,
        "name": "Чокер з натуральними перлинами",
        "category": "chokers",
        "price": 450,
        "image": "/static/images/choker1.jpg",
        "description": "Елегантний чокер з натуральними перлинами ручної роботи",
        "in_stock": True
    },
    {
        "id": 2,
        "name": "Браслет з червоним камінням",
        "category": "bracelets",
        "price": 380,
        "image": "/static/images/bracelet1.jpg",
        "description": "Стильний браслет з червоним камінням та срібними елементами",
        "in_stock": True
    },
    {
        "id": 3,
        "name": "Сережки з срібними сердечками",
        "category": "earrings",
        "price": 320,
        "image": "/static/images/earrings1.jpg",
        "description": "Ніжні сережки з срібними сердечками ручної роботи",
        "in_stock": True
    },
    {
        "id": 4,
        "name": "Комплект з перлин",
        "category": "sets",
        "price": 650,
        "image": "/static/images/set1.jpg",
        "description": "Повний комплект: сережки + браслет + чокер з натуральних перлин",
        "in_stock": True
    }
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/products')
def get_products():
    category = request.args.get('category')
    if category:
        filtered_products = [p for p in products if p['category'] == category]
        return jsonify(filtered_products)
    return jsonify(products)

@app.route('/api/products/<int:product_id>')
def get_product(product_id):
    product = next((p for p in products if p['id'] == product_id), None)
    if product:
        return jsonify(product)
    return jsonify({"error": "Product not found"}), 404

@app.route('/api/categories')
def get_categories():
    categories = list(set(p['category'] for p in products))
    return jsonify(categories)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000) 