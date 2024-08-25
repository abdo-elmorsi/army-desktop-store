// src/components/UsersComponent.jsx
import React, { useState } from 'react';
import useIndexedDB from '@/hooks/useIndexedDB';
import useAuth from '@/hooks/useAuth';

const UsersComponent = () => {
  const { user } = useAuth();
  const { data: users, addItem, updateItem, deleteItem } = useIndexedDB('users');
  const [newUser, setNewUser] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddUser = () => {
    if (newUser.trim()) {
      addItem({ name: newUser });
      setNewUser('');
    }
  };

  const handleEditUser = (id, name) => {
    setEditId(id);
    setEditValue(name);
  };

  const handleUpdateUser = () => {
    if (editValue.trim()) {
      updateItem(editId, { name: editValue });
      setEditId(null);
      setEditValue('');
    }
  };

  if (!user) {
    return <div>Please log in to manage users.</div>;
  }

  return (
    <div>
      <h1>Users</h1>

      <div>
        <input
          type="text"
          value={newUser}
          onChange={(e) => setNewUser(e.target.value)}
        />
        <button onClick={handleAddUser}>Add User</button>
      </div>

      {editId !== null && (
        <div>
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
          />
          <button onClick={handleUpdateUser}>Update User</button>
          <button onClick={() => setEditId(null)}>Cancel</button>
        </div>
      )}

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}
            <button onClick={() => handleEditUser(user.id, user.name)}>Edit</button>
            <button onClick={() => deleteItem(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UsersComponent;
