import React, { useState, useEffect, useCallback } from 'react';
import { Input, Button, Error } from '@/components'; // Ensure you have these components
import { useDatabase } from '@/hooks'; // Import your custom hook

export default function Users() {
    const { data: users, loading, error, addItem, updateItem, deleteItem } = useDatabase('users');

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [editingUser, setEditingUser] = useState(null);


    const handleAddUser = async () => {
        if (username.trim() === '' || password.trim() === '' || role.trim() === '') return;
        await addItem([username, password, role]);
        setUsername('');
        setPassword('');
        setRole('');
    };

    const handleEditUser = async () => {
        if (!editingUser || username.trim() === '' || password.trim() === '' || role.trim() === '') return;
        await updateItem(editingUser.id, [username, password, role]);
        setEditingUser(null);
        setUsername('');
        setPassword('');
        setRole('');
    };

    const handleDelete = useCallback(async (id) => {
        const confirmationMessage = 'هل انت متأكد من حذف هذا المخزن';
        const isConfirmed = window.location.host.includes('vercel.app')
            ? window.confirm(confirmationMessage)
            : await window.ipcRenderer.showPrompt(confirmationMessage, 'John Doe');

        if (isConfirmed) {
            await deleteItem(id);
        }
    }, [deleteItem]);


    if (loading) return <p>Loading...</p>;

    if (error) {
        return <Error message={error} onRetry={() => window.location.reload()} />;
    }

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
                        className="mt-2 btn--primary"
                    >
                        {editingUser ? "تحديث" : "إضافة"}
                    </Button>
                </div>
            </form>


            <table className="mt-5 w-full bg-white dark:bg-gray-800 shadow-md rounded border border-gray-200 dark:border-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th className="p-4 text-gray-800 dark:text-gray-300">الرقم التسلسلي</th>
                        <th className="p-4 text-gray-800 dark:text-gray-300">ألاسم</th>
                        <th className="p-4 text-gray-800 dark:text-gray-300">الصلاحيه</th>
                        <th className="p-4 text-gray-800 dark:text-gray-300">الاوامر</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? (
                        Array.from({ length: 5 }).map((_, index) => (
                            <TableSkeleton key={index} />
                        ))
                    ) : (
                        users.map((user, i) => (
                            <tr key={user.id}>
                                <td className="text-center p-4 text-gray-800 dark:text-gray-200">{i + 1}</td>
                                <td className="text-center p-4 text-gray-800 dark:text-gray-200">{user.username}</td>
                                <td className="text-center p-4 text-gray-800 dark:text-gray-200">{user.role}</td>
                                <td className="p-4 justify-center gap-2 flex">

                                    <Button disabled={loading}
                                        onClick={() => {
                                            setUsername(user.username);
                                            setPassword(user.password);
                                            setRole(user.role);
                                            setEditingUser(user);
                                        }}
                                        className="bg-primary text-white">تعديل</Button>

                                    <Button disabled={loading} onClick={() => handleDelete(user.id)} className="btn--red">
                                        حذف
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>


        </div>
    );
}

const TableSkeleton = () => {
    return <tr>
        <td className="p-4 text-center">
            <div className="animate-pulse bg-gray-300 rounded h-8 w-12 mx-auto"></div>
        </td>
        <td className="p-4 text-center">
            <div className="animate-pulse bg-gray-300 rounded h-8 w-32 mx-auto"></div>
        </td>
        <td className="p-4 text-center">
            <div className="animate-pulse bg-gray-300 rounded h-8 w-48 mx-auto"></div>
        </td>
        <td className="p-4 text-center">
            <div className="flex justify-center gap-2">
                <div className="animate-pulse bg-gray-300 rounded h-8 w-16"></div>
                <div className="animate-pulse bg-gray-300 rounded h-8 w-16"></div>
            </div>
        </td>
    </tr>
}