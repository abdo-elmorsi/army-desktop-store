// src/CategoriesComponent.jsx
import React, { useState } from 'react';
import useIndexedDB from '@/hooks/useIndexedDB';

const CategoriesComponent = () => {
  const { data: categories, addItem, updateItem, deleteItem } = useIndexedDB('categories');
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      addItem({ name: newCategory });
      setNewCategory('');
    }
  };

  const handleEditCategory = (id, name) => {
    setEditId(id);
    setEditValue(name);
  };

  const handleUpdateCategory = () => {
    if (editValue.trim()) {
      updateItem(editId, { name: editValue });
      setEditId(null);
      setEditValue('');
    }
  };

  return (
    <div>
      <h1>Categories</h1>

      <div>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
        <button onClick={handleAddCategory}>Add Category</button>
      </div>

      {editId !== null && (
        <div>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <button onClick={handleUpdateCategory}>Update Category</button>
          <button onClick={() => setEditId(null)}>Cancel</button>
        </div>
      )}

      <ul>
        {categories.map((category) => (
          <li key={category.id}>
            {category.name}
            <button onClick={() => handleEditCategory(category.id, category.name)}>Edit</button>
            <button onClick={() => deleteItem(category.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoriesComponent;
