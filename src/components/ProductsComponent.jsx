// src/ProductsComponent.jsx
import React, { useState } from 'react';
import useIndexedDB from '@/hooks/useIndexedDB';

const ProductsComponent = () => {
  const { data: products, addItem, updateItem, deleteItem } = useIndexedDB('products');
  const [newProduct, setNewProduct] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      addItem({ name: newProduct });
      setNewProduct('');
    }
  };

  const handleEditProduct = (id, name) => {
    setEditId(id);
    setEditValue(name);
  };

  const handleUpdateProduct = () => {
    if (editValue.trim()) {
      updateItem(editId, { name: editValue });
      setEditId(null);
      setEditValue('');
    }
  };

  return (
    <div>
      <h1>Products</h1>

      <div>
        <input
          type="text"
          value={newProduct}
          onChange={(e) => setNewProduct(e.target.value)}
        />
        <button onClick={handleAddProduct}>Add Product</button>
      </div>

      {editId !== null && (
        <div>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <button onClick={handleUpdateProduct}>Update Product</button>
          <button onClick={() => setEditId(null)}>Cancel</button>
        </div>
      )}

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name}
            <button onClick={() => handleEditProduct(product.id, product.name)}>Edit</button>
            <button onClick={() => deleteItem(product.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsComponent;
