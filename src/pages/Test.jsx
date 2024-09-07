import React, { useEffect, useState } from 'react';
import { Input, Button } from '@/components'; // Ensure you have these components

export default function Users() {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersFromDB = await window.ipcRenderer.invoke('get-users');
            setUsers(usersFromDB);
        };
        fetchUsers();
    }, []);

    const handleAddUser = async () => {
        if (username.trim() === '' || password.trim() === '' || role.trim() === '') return;
        const newUser = await window.ipcRenderer.invoke('add-user', username, password, role);
        setUsers([...users, newUser]);
        setUsername('');
        setPassword('');
        setRole('');
    };

    const handleEditUser = async () => {
        if (!editingUser || username.trim() === '' || password.trim() === '' || role.trim() === '') return;
        const updatedUser = await window.ipcRenderer.invoke('update-user', editingUser.id, username, password, role);
        setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setRole('');
    };

    const handleDeleteUser = async (id) => {
        await window.ipcRenderer.invoke('delete-user', id);
        setUsers(users.filter(user => user.id !== id));
    };

    return (
        <div className="p-6 px-8 rounded-md bg-gray-50 dark:bg-gray-900">
            <h1 className="text-2xl mb-4 text-gray-800 dark:text-white">إدارة المستخدمين</h1>
            <form className='mt-10'>
                <div className='flex flex-col gap-4'>
                    <Input
                        label="اسم المستخدم"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        name="username"
                    />
                    <Input
                        label="كلمة المرور"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        name="password"
                    />
                    <Input
                        label="الدور"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        name="role"
                    />
                    <Button
                        onClick={editingUser ? handleEditUser : handleAddUser}
                        className="mt-2"
                    >
                        {editingUser ? "تحديث" : "إضافة"}
                    </Button>
                </div>
            </form>

            <ul className="mt-6">
                {users.map(user => (
                    <li key={user.id} className="flex justify-between items-center mb-2">
                        <span>{user.username} - {user.role}</span>
                        <div>
                            <Button
                                onClick={() => {
                                    setUsername(user.username);
                                    setPassword(user.password);
                                    setRole(user.role);
                                    setEditingUser(user);
                                }}
                                className="ml-2"
                            >
                                تعديل
                            </Button>
                            <Button
                                onClick={() => handleDeleteUser(user.id)}
                                className="ml-2"
                                variant="danger"
                            >
                                حذف
                            </Button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
